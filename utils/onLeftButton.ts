export default function onLeftButton<T extends MouseEvent>(
  callback: (e: T) => void
) {
  return (e: T) => {
    if (e.button === 1) {
      callback(e);
    }
  };
}
