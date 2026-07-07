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

export function cropSalt(value: string): string {
  const index = value.lastIndexOf('~');
  return index > 0 ? value.slice(0, index) : value;
}
