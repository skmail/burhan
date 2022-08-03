import { useCallback } from "react";
import shallow from "zustand/shallow";
import { useFontStore } from "../../store/font/reducer";
import Button from "../Button";

export default function DownloadButton() {
  const font = useFontStore(
    (state) => ({
      familyName: String(state.font?.familyName),
      subfamilyName: String(state.font?.familyName),
      downloadUrl: state.downloadUrl,
    }),
    shallow
  );
  const download = useCallback(() => {
    if (!font.downloadUrl) {
      return;
    }
    const familyName = font.familyName;
    const styleName = font.subfamilyName;
    const fileName = familyName.replace(/\s/g, "") + "-" + styleName + ".otf";
    const link = document.createElement("a");
    link.href = font.downloadUrl;
    link.download = fileName;
    link.click();
  }, [font]);
  return (
    <button className="flex items-center  mr-4 text-main" onClick={download}>
      Download font
      <svg
        className="w-8 h-8 text-icon ml-2"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="24" height="24" fill="white" />
        <path
          d="M15.4335 10H8.5665L8.5 12.3333H9.08333C9.29333 11.0547 9.49867 10.9427 11.0597 10.8925L11.4015 10.8808V16.8192C11.4015 17.3675 11.2848 17.4982 10.3538 17.5833V18.1667H13.645V17.5833C12.7082 17.4982 12.5915 17.3687 12.5915 16.8203V10.8808L12.9392 10.8925C14.5002 10.9427 14.7055 11.0558 14.9155 12.3333H15.4988L15.4323 10H15.4335Z"
          fill="#707C88"
        />
        <path
          d="M19 8.25V19.3333C19 19.9522 18.7542 20.5457 18.3166 20.9832C17.879 21.4208 17.2855 21.6667 16.6667 21.6667H7.33333C6.71449 21.6667 6.121 21.4208 5.68342 20.9832C5.24583 20.5457 5 19.9522 5 19.3333V5.33333C5 4.71449 5.24583 4.121 5.68342 3.68342C6.121 3.24583 6.71449 3 7.33333 3H13.75L19 8.25ZM15.5 8.25C15.0359 8.25 14.5908 8.06563 14.2626 7.73744C13.9344 7.40925 13.75 6.96413 13.75 6.5V4.16667H7.33333C7.02391 4.16667 6.72717 4.28958 6.50838 4.50838C6.28958 4.72717 6.16667 5.02391 6.16667 5.33333V19.3333C6.16667 19.6428 6.28958 19.9395 6.50838 20.1583C6.72717 20.3771 7.02391 20.5 7.33333 20.5H16.6667C16.9761 20.5 17.2728 20.3771 17.4916 20.1583C17.7104 19.9395 17.8333 19.6428 17.8333 19.3333V8.25H15.5Z"
          fill="#707C88"
        />
      </svg>
    </button>
  );
}
