import pool from '../config/db.js';
import { validarCPF, validarCNPJ, validarWhatsApp } from '../utils/validators.js';

const clientesController = {
  // Cadastrar cliente
  async cadastrar(req, res) {
    try {
      const { 
        estabelecimento_id, 
        nome, 
        cpf, 
        cnpj, 
        endereco, 
        whatsapp, 
        email, 
        taxa_entrega 
      } = req.body;

      // Validações obrigatórias
      if (!estabelecimento_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'estabelecimento_id é obrigatório' 
        });
      }

      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      // Validação de CPF se fornecido
      if (cpf && cpf.trim() !== '') {
        if (!validarCPF(cpf)) {
          return res.status(400).json({ 
            success: false, 
            message: 'CPF inválido' 
          });
        }
      }

      // Validação de CNPJ se fornecido
      if (cnpj && cnpj.trim() !== '') {
        if (!validarCNPJ(cnpj)) {
          return res.status(400).json({ 
            success: false, 
            message: 'CNPJ inválido' 
          });
        }
      }

      // Validação de WhatsApp se fornecido
      if (whatsapp && whatsapp.trim() !== '') {
        if (!validarWhatsApp(whatsapp)) {
          return res.status(400).json({ 
            success: false, 
            message: 'WhatsApp inválido. Use o formato (XX) XXXXX-XXXX' 
          });
        }
      }

      // Validação de email se fornecido
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email inválido' 
          });
        }
      }

      // Verificar se já existe cliente com mesmo CPF/CNPJ no estabelecimento
      if (cpf && cpf.trim() !== '') {
        const cpfExists = await pool.query(
          'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cpf = $2 AND status = true',
          [estabelecimento_id, cpf]
        );
        if (cpfExists.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe um cliente cadastrado com este CPF' 
          });
        }
      }

      if (cnpj && cnpj.trim() !== '') {
        const cnpjExists = await pool.query(
          'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cnpj = $2 AND status = true',
          [estabelecimento_id, cnpj]
        );
        if (cnpjExists.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe um cliente cadastrado com este CNPJ' 
          });
        }
      }

      // Inserir cliente
      const result = await pool.query(
        `INSERT INTO clientes (
          estabelecimento_id, nome, cpf, cnpj, endereco, 
          whatsapp, email, taxa_entrega
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`,
        [
          estabelecimento_id,
          nome.trim(),
          cpf ? cpf.trim() : null,
          cnpj ? cnpj.trim() : null,
          endereco ? endereco.trim() : null,
          whatsapp ? whatsapp.trim() : null,
          email ? email.trim().toLowerCase() : null,
          taxa_entrega ? parseFloat(taxa_entrega) : 0
        ]
      );

      res.json({ 
        success: true, 
        message: 'Cliente cadastrado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao cadastrar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Listar clientes por estabelecimento
  async listarPorEstabelecimento(req, res) {
    try {
      const { estabelecimento_id } = req.params;

      if (!estabelecimento_id) {
        return res.status(400).json({ 
          success: false, 
          message: 'estabelecimento_id é obrigatório' 
        });
      }

      const result = await pool.query(
        `SELECT * FROM clientes 
         WHERE estabelecimento_id = $1 
         ORDER BY nome ASC`,
        [estabelecimento_id]
      );

      res.json({ 
        success: true, 
        data: result.rows 
      });

    } catch (error) {
      console.error('Erro ao listar clientes:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Editar cliente
  async editar(req, res) {
    try {
      const { id } = req.params;
      const { 
        nome, 
        cpf, 
        cnpj, 
        endereco, 
        whatsapp, 
        email, 
        taxa_entrega 
      } = req.body;

      // Validações obrigatórias
      if (!nome || nome.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nome é obrigatório e deve ter pelo menos 2 caracteres' 
        });
      }

      // Validação de CPF se fornecido
      if (cpf && cpf.trim() !== '') {
        if (!validarCPF(cpf)) {
          return res.status(400).json({ 
            success: false, 
            message: 'CPF inválido' 
          });
        }
      }

      // Validação de CNPJ se fornecido
      if (cnpj && cnpj.trim() !== '') {
        if (!validarCNPJ(cnpj)) {
          return res.status(400).json({ 
            success: false, 
            message: 'CNPJ inválido' 
          });
        }
      }

      // Validação de WhatsApp se fornecido
      if (whatsapp && whatsapp.trim() !== '') {
        if (!validarWhatsApp(whatsapp)) {
          return res.status(400).json({ 
            success: false, 
            message: 'WhatsApp inválido. Use o formato (XX) XXXXX-XXXX' 
          });
        }
      }

      // Validação de email se fornecido
      if (email && email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email inválido' 
          });
        }
      }

      // Verificar se já existe outro cliente com mesmo CPF/CNPJ no estabelecimento
      const clienteAtual = await pool.query(
        'SELECT estabelecimento_id FROM clientes WHERE id = $1',
        [id]
      );

      if (clienteAtual.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }

      const estabelecimento_id = clienteAtual.rows[0].estabelecimento_id;

      if (cpf && cpf.trim() !== '') {
        const cpfExists = await pool.query(
          'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cpf = $2 AND id != $3 AND status = true',
          [estabelecimento_id, cpf, id]
        );
        if (cpfExists.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe outro cliente cadastrado com este CPF' 
          });
        }
      }

      if (cnpj && cnpj.trim() !== '') {
        const cnpjExists = await pool.query(
          'SELECT id FROM clientes WHERE estabelecimento_id = $1 AND cnpj = $2 AND id != $3 AND status = true',
          [estabelecimento_id, cnpj, id]
        );
        if (cnpjExists.rows.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Já existe outro cliente cadastrado com este CNPJ' 
          });
        }
      }

      // Atualizar cliente
      const result = await pool.query(
        `UPDATE clientes SET 
          nome = $1, cpf = $2, cnpj = $3, endereco = $4, 
          whatsapp = $5, email = $6, taxa_entrega = $7, 
          updated_at = CURRENT_TIMESTAMP
         WHERE id = $8 
         RETURNING *`,
        [
          nome.trim(),
          cpf ? cpf.trim() : null,
          cnpj ? cnpj.trim() : null,
          endereco ? endereco.trim() : null,
          whatsapp ? whatsapp.trim() : null,
          email ? email.trim().toLowerCase() : null,
          taxa_entrega ? parseFloat(taxa_entrega) : 0,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Cliente atualizado com sucesso',
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao editar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Deletar cliente
  async deletar(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM clientes WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: 'Cliente deletado com sucesso' 
      });

    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Alterar status do cliente
  async alterarStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (typeof status !== 'boolean') {
        return res.status(400).json({ 
          success: false, 
          message: 'Status deve ser true ou false' 
        });
      }

      const result = await pool.query(
        'UPDATE clientes SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
        [status, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }

      res.json({ 
        success: true, 
        message: `Cliente ${status ? 'ativado' : 'desativado'} com sucesso`,
        data: result.rows[0]
      });

    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  },

  // Buscar cliente específico por ID
  async buscarPorId(req, res) {
    try {
      const { estabelecimento_id, id } = req.params;
      
      if (!estabelecimento_id || !id) {
        return res.status(400).json({ 
          success: false, 
          message: 'estabelecimento_id e id são obrigatórios' 
        });
      }

      const cliente = await pool.query(
        'SELECT * FROM clientes WHERE id = $1 AND estabelecimento_id = $2 AND status = true',
        [id, estabelecimento_id]
      );

      if (cliente.rows.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Cliente não encontrado' 
        });
      }

      return res.json({ 
        success: true, 
        data: cliente.rows[0] 
      });
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor' 
      });
    }
  }
};

export default clientesController;

