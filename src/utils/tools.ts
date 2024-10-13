export const timestampToDateTime = (timestamp: number) => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    timeZone: 'UTC',
    timeZoneName: 'short',
  };

  return new Date(timestamp).toLocaleString('en-GB', options);
};
