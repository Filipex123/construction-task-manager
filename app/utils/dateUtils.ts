export const formatDatetoView = (dateString: string | undefined) => {
  if (!dateString) return '--/--/----';
  const date = new Date(dateString);

  if (isNaN(date.getTime())) return dateString;

  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatDateStringtoView = (dateString: string | undefined) => {
  if (!dateString) return '--/--/----';
  const dateArray = dateString.split('-');

  return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
};

export const formatDateStringtoViewDueDate = (dateString: string | undefined) => {
  if (!dateString || dateString == '--/--/----') return '--/--/----';

  const dateArray = dateString.split('-');
  return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
};

export const formatDatetimeStringtoView = (dateString: string | undefined) => {
  if (!dateString) return '--/--/----';
  const isoDateStringArray = dateString.split(' ');
  const dateArray = isoDateStringArray[0].split('-');
  return `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
};

// Função para converter DD/MM/YYYY para YYYY-MM-DD (formato do input date)
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return '';

  // Se já está no formato YYYY-MM-DD, retorna como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Se está no formato DD/MM/YYYY, converte para YYYY-MM-DD
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    const [day, month, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
  }

  return '';
};
