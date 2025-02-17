import { useRouter } from "next/router";
import { useState } from "react";
import shallow from "zustand/shallow";
import useGlyphLookup from "../hooks/useGlyphLookup";
import { useFontStore } from "../store/font/reducer";
import { useWorkspaceStore } from "../store/workspace/reducer";
import DownloadButton from "./Editor/DownloadButton";

type ButtonProps = JSX.IntrinsicElements["button"];
interface Props extends ButtonProps {
  active?: boolean;
}
function Button({ active = false, className, ...props }: Props) {
  let cls = "";
  if (active) {
    cls += "text-active-2 bg-active-1";
  } else {
    cls += "text-icon hover:bg-input-bg";
  }
  return (
    <button
      {...props}
      className={`h-10 w-10  rounded-lg  flex items-center justify-center ${className} ${cls}`}
    />
  );
}

const codeViews = ["oct", "hex", "html", "dec", "char"] as const;

export default function Header() {

  const router = useRouter()
  
  const [leftSidebar, toggleLeftSidebarSide] = useWorkspaceStore(
    (state) => [state.leftSidebar, state.toggleLeftSidebarSide],
    shallow
  );
  const [charCodeView, setCharCodeView] =
    useState<typeof codeViews[number]>("oct");

  const glyph = useFontStore((state) => {
    if (!state.font || !state.selectedGlyphId) {
      return;
    }
    const glyph = state.font.glyphs.items[state.selectedGlyphId];

    return {
      name: glyph.string,
      codePoint: glyph.codePoints.map((c) => "U+" + c.toString(16)).join("+"),
      codePoints: glyph.codePoints,
    };
  }, shallow);

  const lookup = useGlyphLookup(glyph?.codePoints || []);

  const [nextGlyph, previousGlyph] = useFontStore((state) => [
    state.nextGlyph,
    state.previousGlyph,
  ]);

  if (!glyph) {
    return null;
  }
  return (
    <div className="h-14 bg-bg-2 flex-shrink-0 text-black justify-between items-center flex px-4 text-main border-b-2 border-outline">
      <div className="flex items-center">
        <Button 
        onClick={() => {
          router.push('/')
        }}
        className="mr-1">
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.57488 12.7003V12.5253H6.39988H5.6999C5.69989 12.5253 5.69988 12.5253 5.69987 12.5253C5.59606 12.5253 5.49459 12.4945 5.40828 12.4368C5.32196 12.3791 5.25469 12.2971 5.21496 12.2012C5.17523 12.1053 5.16483 11.9997 5.18508 11.8979C5.20533 11.7961 5.25532 11.7025 5.32872 11.6291L11.6288 5.32899L11.6289 5.32888C11.6776 5.2801 11.7355 5.2414 11.7991 5.215C11.8628 5.18859 11.9311 5.175 12 5.175C12.0689 5.175 12.1372 5.18859 12.2009 5.215C12.2645 5.2414 12.3224 5.2801 12.3711 5.32888L12.3712 5.32899L18.6713 11.6291C18.6713 11.6291 18.6713 11.6291 18.6713 11.6291C18.7447 11.7025 18.7947 11.7961 18.8149 11.8979C18.8352 11.9997 18.8248 12.1053 18.785 12.2012C18.7453 12.2971 18.678 12.3791 18.5917 12.4368C18.5054 12.4945 18.4039 12.5253 18.3001 12.5253C18.3001 12.5253 18.3001 12.5253 18.3001 12.5253H17.6001H17.4251V12.7003V17.6004C17.4251 18.2759 16.8756 18.8254 16.2001 18.8254H7.79991C7.12444 18.8254 6.57488 18.2759 6.57488 17.6004V12.7003ZM10.425 17.6004V17.7754H10.6H13.4H13.575V17.6004V14.1003V13.9253H13.4H10.6H10.425V14.1003V17.6004ZM12.1237 6.56623L12 6.44249L11.8763 6.56623L7.67617 10.7663L7.62491 10.8176V10.8901V17.6004V17.7754H7.79991H9.19994H9.37494V17.6004V14.1003C9.37494 13.4249 9.9245 12.8753 10.6 12.8753H13.4C14.0755 12.8753 14.6251 13.4249 14.6251 14.1003V17.6004V17.7754H14.8001H16.2008H16.3758L16.3758 17.6004L16.3751 14.1003V14.1003V10.8901V10.8176L16.3238 10.7663L12.1237 6.56623Z"
              fill="currentColor"
              stroke="#fff"
              strokeWidth="0"
            />
          </svg>
        </Button>
        <Button
          onClick={toggleLeftSidebarSide}
          active={leftSidebar}
          className="mr-4"
        >
          <svg
            className="w-8 h-8"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7.18749 8.62501C7.30352 8.62501 7.4148 8.57892 7.49685 8.49687C7.57889 8.41482 7.62499 8.30354 7.62499 8.18751C7.62499 8.07148 7.57889 7.9602 7.49685 7.87815C7.4148 7.7961 7.30352 7.75001 7.18749 7.75001C7.07146 7.75001 6.96018 7.7961 6.87813 7.87815C6.79608 7.9602 6.74999 8.07148 6.74999 8.18751C6.74999 8.30354 6.79608 8.41482 6.87813 8.49687C6.96018 8.57892 7.07146 8.62501 7.18749 8.62501ZM8.93749 8.18751C8.93749 8.30354 8.89139 8.41482 8.80935 8.49687C8.7273 8.57892 8.61602 8.62501 8.49999 8.62501C8.38396 8.62501 8.27268 8.57892 8.19063 8.49687C8.10858 8.41482 8.06249 8.30354 8.06249 8.18751C8.06249 8.07148 8.10858 7.9602 8.19063 7.87815C8.27268 7.7961 8.38396 7.75001 8.49999 7.75001C8.61602 7.75001 8.7273 7.7961 8.80935 7.87815C8.89139 7.9602 8.93749 8.07148 8.93749 8.18751ZM9.81249 8.62501C9.92852 8.62501 10.0398 8.57892 10.1218 8.49687C10.2039 8.41482 10.25 8.30354 10.25 8.18751C10.25 8.07148 10.2039 7.9602 10.1218 7.87815C10.0398 7.7961 9.92852 7.75001 9.81249 7.75001C9.69646 7.75001 9.58518 7.7961 9.50313 7.87815C9.42108 7.9602 9.37499 8.07148 9.37499 8.18751C9.37499 8.30354 9.42108 8.41482 9.50313 8.49687C9.58518 8.57892 9.69646 8.62501 9.81249 8.62501Z"
              fill="currentColor"
            />
            <path
              d="M6.75 6C6.28587 6 5.84075 6.18437 5.51256 6.51256C5.18437 6.84075 5 7.28587 5 7.75V16.5C5 16.9641 5.18437 17.4092 5.51256 17.7374C5.84075 18.0656 6.28587 18.25 6.75 18.25H17.25C17.7141 18.25 18.1592 18.0656 18.4874 17.7374C18.8156 17.4092 19 16.9641 19 16.5V7.75C19 7.28587 18.8156 6.84075 18.4874 6.51256C18.1592 6.18437 17.7141 6 17.25 6H6.75ZM17.25 6.875C17.4821 6.875 17.7046 6.96719 17.8687 7.13128C18.0328 7.29538 18.125 7.51794 18.125 7.75V9.5H5.875V7.75C5.875 7.51794 5.96719 7.29538 6.13128 7.13128C6.29538 6.96719 6.51794 6.875 6.75 6.875H17.25ZM5.875 16.5V10.375H9.375V17.375H6.75C6.51794 17.375 6.29538 17.2828 6.13128 17.1187C5.96719 16.9546 5.875 16.7321 5.875 16.5ZM10.25 17.375V10.375H18.125V16.5C18.125 16.7321 18.0328 16.9546 17.8687 17.1187C17.7046 17.2828 17.4821 17.375 17.25 17.375H10.25Z"
              fill="currentColor"
            />
          </svg>
        </Button>
        <span className="text-main text-medium mr-6 flex items-center">
          {!lookup.isLoading && !!lookup.data ? (
            <span className="capitalize">
              {lookup.data.map((data) => data.name).join("")}
            </span>
          ) : (
            <span className="w-20 h-5 bg-bg-1 rounded-md animate-pulse" />
          )}

          {!lookup.isLoading && !!lookup.data ? (
            <button
              onClick={(e) => {
                const index = codeViews.indexOf(charCodeView);
                if (index >= codeViews.length - 1) {
                  setCharCodeView(codeViews[0]);
                } else {
                  setCharCodeView(codeViews[index + 1]);
                }
              }}
              className="text-sm font-light ml-2 hover:bg-bg-1 px-2 py-0.5 rounded-md text-main"
            >
              ({" "}
              {lookup.data
                .map(
                  (data) =>
                    `${charCodeView === "oct" ? "U+" : ""}${data[charCodeView]}`
                )
                .join(" ")}{" "}
              )
            </button>
          ) : (
            <span className="w-10 h-5 bg-bg-1 ml-2 rounded-md animate-pulse" />
          )}
        </span>

        <button
          onClick={previousGlyph}
          className="text-icon mr-2 hover:bg-input-bg w-6 h-6 flex items-center justify-center rounded-md"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 5L8 12L15 19L16.7344 17.2656L11.4687 12L16.7344 6.73436L15 5Z"
              fill="currentColor"
            />
          </svg>
        </button>
        <button
          onClick={nextGlyph}
          className="text-icon mr-4 hover:bg-input-bg w-6 h-6 flex items-center justify-center rounded-md"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.73436 19L16.7344 12L9.73436 5L8 6.73436L13.2656 12L8 17.2656L9.73436 19Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center">
        <DownloadButton />

        <button className="flex items-center mr-4 text-main">
          Font settings
          <svg
            className="w-8 h-8 text-icon ml-2"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 15.4003C13.6388 15.4003 14.9715 14.0676 14.9715 12.4288C14.9715 10.79 13.6388 9.45728 12 9.45728C10.3612 9.45728 9.0285 10.79 9.0285 12.4288C9.0285 14.0676 10.3612 15.4003 12 15.4003ZM12 10.943C12.8053 10.943 13.4858 11.6235 13.4858 12.4288C13.4858 13.2341 12.8053 13.9145 12 13.9145C11.1947 13.9145 10.5143 13.2341 10.5143 12.4288C10.5143 11.6235 11.1947 10.943 12 10.943Z"
              fill="currentColor"
            />
            <path
              d="M5.19896 15.5013L5.94184 16.7865C6.33631 17.4677 7.2857 17.7232 7.96989 17.3288L8.36288 17.1015C8.79266 17.4395 9.26652 17.7175 9.77137 17.9275V18.3718C9.77137 19.1912 10.4377 19.8575 11.2571 19.8575H12.7429C13.5623 19.8575 14.2286 19.1912 14.2286 18.3718V17.9275C14.7333 17.7174 15.2071 17.4398 15.6371 17.1022L16.0301 17.3295C16.7158 17.7232 17.6629 17.4692 18.0589 16.7865L18.801 15.502C18.9979 15.1608 19.0513 14.7554 18.9495 14.3749C18.8477 13.9944 18.599 13.6698 18.258 13.4725L17.8828 13.2556C17.9626 12.7078 17.9626 12.1513 17.8828 11.6034L18.258 11.3865C18.5988 11.1891 18.8474 10.8645 18.9492 10.484C19.051 10.1035 18.9977 9.69822 18.801 9.35697L18.0589 8.07254C17.6644 7.38909 16.7158 7.1328 16.0301 7.52875L15.6371 7.75607C15.2073 7.41799 14.7335 7.14008 14.2286 6.92999V6.48575C14.2286 5.66636 13.5623 5 12.7429 5H11.2571C10.4377 5 9.77137 5.66636 9.77137 6.48575V6.92999C9.26669 7.14011 8.79287 7.41776 8.36288 7.75533L7.96989 7.52801C7.28348 7.13354 6.33557 7.38909 5.9411 8.0718L5.19896 9.35623C5.00209 9.69743 4.9487 10.1028 5.05052 10.4834C5.15234 10.8639 5.40105 11.1885 5.74201 11.3858L6.11716 11.6027C6.0371 12.1502 6.0371 12.7065 6.11716 13.2541L5.74201 13.471C5.40115 13.6686 5.15256 13.9933 5.05075 14.3739C4.94895 14.7545 5.00225 15.1599 5.19896 15.5013V15.5013ZM7.66977 13.4525C7.58589 13.1177 7.54323 12.7739 7.54274 12.4288C7.54274 12.0856 7.58583 11.7409 7.66903 11.4051C7.70821 11.2486 7.69532 11.0836 7.63232 10.935C7.56932 10.7865 7.45963 10.6626 7.31988 10.582L6.48563 10.0991L7.22702 8.81467L8.07761 9.30646C8.21633 9.38672 8.37733 9.41983 8.53646 9.40081C8.69559 9.38179 8.84426 9.31167 8.96015 9.20097C9.46272 8.72297 10.0688 8.36732 10.7312 8.16168C10.8833 8.11523 11.0166 8.02115 11.1112 7.8933C11.2059 7.76545 11.2571 7.61059 11.2571 7.45149V6.48575H12.7429V7.45149C12.7429 7.61059 12.7941 7.76545 12.8888 7.8933C12.9834 8.02115 13.1167 8.11523 13.2688 8.16168C13.9311 8.36762 14.5371 8.72322 15.0399 9.20097C15.1559 9.31145 15.3045 9.38143 15.4636 9.40044C15.6227 9.41946 15.7836 9.38648 15.9224 9.30646L16.7722 8.81541L17.5151 10.0998L16.6801 10.582C16.5405 10.6627 16.4308 10.7866 16.3679 10.9351C16.3049 11.0836 16.2919 11.2486 16.331 11.4051C16.4142 11.7409 16.4573 12.0856 16.4573 12.4288C16.4573 12.7712 16.4142 13.1159 16.3302 13.4525C16.2912 13.609 16.3043 13.7741 16.3674 13.9226C16.4306 14.0711 16.5403 14.195 16.6801 14.2756L17.5144 14.7577L16.773 16.0421L15.9224 15.5511C15.7837 15.4707 15.6227 15.4375 15.4635 15.4565C15.3044 15.4756 15.1557 15.5458 15.0399 15.6566C14.5373 16.1346 13.9312 16.4902 13.2688 16.6958C13.1167 16.7423 12.9834 16.8364 12.8888 16.9642C12.7941 17.0921 12.7429 17.2469 12.7429 17.406L12.7444 18.3718H11.2571V17.406C11.2571 17.2469 11.2059 17.0921 11.1112 16.9642C11.0166 16.8364 10.8833 16.7423 10.7312 16.6958C10.0689 16.4899 9.46291 16.1343 8.96015 15.6566C8.84449 15.5454 8.69572 15.4751 8.53645 15.4562C8.37717 15.4373 8.21607 15.4709 8.07761 15.5518L7.22776 16.0436L6.48488 14.7592L7.31988 14.2756C7.45968 14.195 7.56945 14.0711 7.63257 13.9226C7.6957 13.7741 7.70876 13.609 7.66977 13.4525V13.4525Z"
              fill="currentColor"
            />
          </svg>
        </button>

        <button>
          <svg
            width="7"
            height="24"
            viewBox="0 0 7 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-1.31134e-07 3C-1.56894e-07 3.39397 0.0798139 3.78407 0.234886 4.14805C0.389957 4.51203 0.61725 4.84274 0.903785 5.12132C1.19032 5.3999 1.53049 5.62087 1.90486 5.77164C2.27924 5.9224 2.68049 6 3.08571 6C3.49094 6 3.89219 5.9224 4.26657 5.77164C4.64094 5.62088 4.98111 5.3999 5.26764 5.12132C5.55418 4.84275 5.78147 4.51203 5.93654 4.14805C6.09161 3.78407 6.17143 3.39397 6.17143 3C6.17143 2.20435 5.84633 1.44129 5.26764 0.87868C4.68896 0.316071 3.9041 1.70653e-07 3.08571 1.34881e-07C2.26733 9.91082e-08 1.48247 0.316071 0.903785 0.87868C0.325101 1.44129 -7.91091e-08 2.20435 -1.31134e-07 3ZM-5.24537e-07 12C-5.50297e-07 12.394 0.0798135 12.7841 0.234885 13.1481C0.389957 13.512 0.617249 13.8427 0.903784 14.1213C1.19032 14.3999 1.53049 14.6209 1.90486 14.7716C2.27924 14.9224 2.68049 15 3.08571 15C3.49094 15 3.89219 14.9224 4.26657 14.7716C4.64094 14.6209 4.98111 14.3999 5.26764 14.1213C5.55418 13.8427 5.78147 13.512 5.93654 13.1481C6.09161 12.7841 6.17143 12.394 6.17143 12C6.17143 11.2044 5.84633 10.4413 5.26764 9.87868C4.68896 9.31607 3.9041 9 3.08571 9C2.26733 9 1.48247 9.31607 0.903784 9.87868C0.325101 10.4413 -4.72512e-07 11.2044 -5.24537e-07 12ZM-9.17939e-07 21C-9.43699e-07 21.394 0.0798131 21.7841 0.234885 22.1481C0.389956 22.512 0.617249 22.8427 0.903784 23.1213C1.19032 23.3999 1.53049 23.6209 1.90486 23.7716C2.27924 23.9224 2.68049 24 3.08571 24C3.49093 24 3.89219 23.9224 4.26656 23.7716C4.64094 23.6209 4.98111 23.3999 5.26764 23.1213C5.55418 22.8427 5.78147 22.512 5.93654 22.1481C6.09161 21.7841 6.17143 21.394 6.17143 21C6.17143 20.2044 5.84633 19.4413 5.26764 18.8787C4.68896 18.3161 3.9041 18 3.08571 18C2.26733 18 1.48247 18.3161 0.903784 18.8787C0.3251 19.4413 -8.65914e-07 20.2044 -9.17939e-07 21Z"
              fill="#707C88"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
