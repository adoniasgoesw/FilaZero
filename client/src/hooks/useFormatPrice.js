import { useMemo } from 'react';

// Hook customizado para formatação de preços
export const useFormatPrice = (price, currency = 'BRL', locale = 'pt-BR') => {
  return useMemo(() => {
    if (!price && price !== 0) return '-';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(price);
  }, [price, currency, locale]);
};

export default useFormatPrice;
