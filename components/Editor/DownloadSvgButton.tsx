import { useCallback } from "react";
import shallow from "zustand/shallow";
import { useFontStore } from "../../store/font/reducer";
import Button from "../Button";

export default function DownloadSvgButton() {
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
    <Button
      roundedR={false}
      onClick={download}
      disabled={!font.downloadUrl}
      className="px-3 pr-2"
    >
      Download .SVG
      <svg
        className="w-8 h-8 ml-2"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 14.4L14.8 10.9H12.7V6H11.3V10.9H9.2L12 14.4Z"
          fill="currentColor"
        />
        <path
          d="M17.6 15.8H6.4V10.9H5V15.8C5 16.5721 5.6279 17.2 6.4 17.2H17.6C18.3721 17.2 19 16.5721 19 15.8V10.9H17.6V15.8Z"
          fill="currentColor"
        />
      </svg>
    </Button>
  );
}
