import bcrypt from 'bcrypt';
import pool from '../config/db.js';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

function isStrongPassword(password) {
  const str = String(password || '');
  // Min 8 chars, at least 1 uppercase, 1 lowercase, 1 digit or letter, 1 symbol
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(str);
}

const registerController = {
  async register(req, res) {
    const client = await pool.connect();
    try {
      const body = req.body || {};
      const nomeCompleto = String(body.nome_completo || body.name || '').trim();
      const email = String(body.email || '').trim().toLowerCase();
      const whatsapp = String(body.whatsapp || '').trim();
      const cpf = String(body.cpf || '').trim();
      const senha = String(body.senha || body.password || '');
      const estabelecimentoNome = String(body.estabelecimento_nome || body.establishmentName || '').trim();
      const estabelecimentoSetor = String(body.estabelecimento_setor || body.establishmentSector || '').trim();
      const cnpjRaw = body.cnpj == null ? '' : String(body.cnpj).trim();

      // Validate required fields
      if (!nomeCompleto || !email || !whatsapp || !cpf || !senha || !estabelecimentoNome || !estabelecimentoSetor) {
        return res.status(400).json({ success: false, message: 'Campos obrigatórios faltando' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'E-mail inválido' });
      }
      if (!isStrongPassword(senha)) {
        return res.status(400).json({ success: false, message: 'Senha fraca. Requisitos: 8+ caracteres, 1 maiúscula, 1 minúscula, 1 símbolo.' });
      }

      await client.query('BEGIN');

      // Check duplicates
      const dupUser = await client.query('SELECT id FROM usuarios WHERE email = $1 OR cpf = $2 LIMIT 1', [email, cpf]);
      if (dupUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'E-mail ou CPF já cadastrado' });
      }

      // Create estabelecimento (cnpj optional)
      const estIns = await client.query(
        `INSERT INTO estabelecimentos (nome, cnpj, setor, plano_atual, status)
         VALUES ($1, NULLIF($2, ''), $3, 'gratuito', true)
         RETURNING id, nome, cnpj, setor, plano_atual, status, criado_em`,
        [estabelecimentoNome, cnpjRaw, estabelecimentoSetor]
      );
      const estabelecimentoId = estIns.rows[0].id;

      // Hash password
      const senhaHash = await bcrypt.hash(senha, 10);

      // Create usuario
      const userIns = await client.query(
        `INSERT INTO usuarios (estabelecimento_id, nome_completo, email, whatsapp, cpf, senha, cargo, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Administrador', true)
         RETURNING id, estabelecimento_id, nome_completo, email, whatsapp, cpf, cargo, status, criado_em`,
        [estabelecimentoId, nomeCompleto, email, whatsapp, cpf, senhaHash]
      );

      await client.query('COMMIT');

      return res.json({ success: true, data: { usuario: userIns.rows[0], estabelecimento: estIns.rows[0] } });
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro no registro:', err);
      return res.status(500).json({ success: false, message: 'Erro no registro' });
    } finally {
      client.release();
    }
  }
};

export default registerController;


