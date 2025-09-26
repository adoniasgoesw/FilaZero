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

function isValidCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) return false;
  
  return true;
}

function isValidCNPJ(cnpj) {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 2;
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  if (firstDigit !== parseInt(cnpj.charAt(12))) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 2;
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = weight === 9 ? 2 : weight + 1;
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  if (secondDigit !== parseInt(cnpj.charAt(13))) return false;
  
  return true;
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
      if (!isValidCPF(cpf)) {
        return res.status(400).json({ success: false, message: 'CPF inválido' });
      }
      if (cnpjRaw && !isValidCNPJ(cnpjRaw)) {
        return res.status(400).json({ success: false, message: 'CNPJ inválido' });
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


