export function formatDate(date: string): string {
  const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  };

  try {
    const parts = date.split(' ');
    const day = parseInt(parts[1], 10);
    const month = parts[2];
    const year = parts[3];

    if (isNaN(day) || !month || !year) {
      throw new Error('Invalid date format');
    }

    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
}

export function CircularHash({ hash }: { hash: string }) {
  if (!hash || hash.length < 16) {
    return <span>{hash}</span>;
  }

  const start = hash.slice(0, 7);
  const end = hash.slice(-7);

  return (
    <span>
      {start}...{end}
    </span>
  );
}
