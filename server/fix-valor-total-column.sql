-- Script para corrigir a coluna valor_total gerada
-- A fórmula atual (acrescimos - desconto) está incorreta
-- Precisamos de uma fórmula que calcule: itens + complementos + acrescimos - desconto

-- Primeiro, vamos remover a coluna gerada atual
ALTER TABLE pedidos DROP COLUMN valor_total;

-- Agora vamos recriar a coluna com a fórmula correta
-- Como não podemos usar subconsultas em colunas geradas, vamos criar uma função
CREATE OR REPLACE FUNCTION calcular_valor_total(pedido_id INTEGER)
RETURNS NUMERIC AS $$
DECLARE
    valor_base NUMERIC := 0;
    desconto_val NUMERIC := 0;
    acrescimo_val NUMERIC := 0;
BEGIN
    -- Calcular valor base (itens + complementos)
    SELECT COALESCE(SUM(valor_total), 0) INTO valor_base
    FROM itens_pedido 
    WHERE pedido_id = $1;
    
    -- Adicionar complementos
    valor_base := valor_base + COALESCE((
        SELECT SUM((c.quantidade)::numeric * c.valor_unitario)
        FROM complementos_itens_pedido c
        JOIN itens_pedido ip ON ip.id = c.item_pedido_id
        WHERE ip.pedido_id = $1
    ), 0);
    
    -- Buscar desconto e acréscimo
    SELECT COALESCE(desconto, 0), COALESCE(acrescimos, 0) 
    INTO desconto_val, acrescimo_val
    FROM pedidos 
    WHERE id = $1;
    
    -- Retornar: valor_base + acrescimos - desconto
    RETURN valor_base + acrescimo_val - desconto_val;
END;
$$ LANGUAGE plpgsql;

-- Adicionar a coluna valor_total como uma coluna normal (não gerada)
ALTER TABLE pedidos ADD COLUMN valor_total NUMERIC(10,2) DEFAULT 0;

-- Atualizar todos os pedidos existentes com o valor correto
UPDATE pedidos 
SET valor_total = calcular_valor_total(id)
WHERE id IS NOT NULL;

-- Criar um trigger para atualizar valor_total automaticamente
CREATE OR REPLACE FUNCTION trigger_atualizar_valor_total()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar valor_total do pedido relacionado
    UPDATE pedidos 
    SET valor_total = calcular_valor_total(NEW.pedido_id)
    WHERE id = NEW.pedido_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar valor_total quando itens ou complementos mudarem
CREATE TRIGGER trigger_atualizar_valor_total_itens
    AFTER INSERT OR UPDATE OR DELETE ON itens_pedido
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_valor_total();

CREATE TRIGGER trigger_atualizar_valor_total_complementos
    AFTER INSERT OR UPDATE OR DELETE ON complementos_itens_pedido
    FOR EACH ROW
    EXECUTE FUNCTION trigger_atualizar_valor_total();

-- Criar trigger para atualizar valor_total quando desconto ou acréscimo mudarem
CREATE OR REPLACE FUNCTION trigger_atualizar_valor_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalcular valor_total quando desconto ou acréscimo mudarem
    NEW.valor_total := calcular_valor_total(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_valor_total_pedido
    BEFORE UPDATE ON pedidos
    FOR EACH ROW
    WHEN (OLD.desconto IS DISTINCT FROM NEW.desconto OR OLD.acrescimos IS DISTINCT FROM NEW.acrescimos)
    EXECUTE FUNCTION trigger_atualizar_valor_total_pedido();






















