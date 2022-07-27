export default function onLeftButton<T extends MouseEvent>(callback: T) {
  return <T extends MouseEvent>(e: T) => {
    if(e.button === 1){
        callback(e);
    }
  };
}
