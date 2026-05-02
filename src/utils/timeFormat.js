export function formatTime(dateInput, format = '24h') {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  
  if (format === '12h') {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
  }
  
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatTimeRange(start, end, format = '24h') {
  if (!start) return '';
  const startTime = formatTime(start, format);
  const endTime = end ? formatTime(end, format) : 'Ongoing';
  return `${startTime} - ${endTime}`;
}
