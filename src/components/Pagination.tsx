import { JSX, useEffect, useRef, useState } from 'react';
import { useDimensions, useUVerifyTheme } from '../utils/hooks';
import {
  BackwardIcon,
  FastBackwardIcon,
  FastForwardIcon,
  ForwardIcon,
} from './Icons';
import { twMerge } from 'tailwind-merge';

declare interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
  const navigationRef = useRef<HTMLDivElement>(null);
  const { components } = useUVerifyTheme();
  const style = components.pagination;
  const { width } = useDimensions(navigationRef);
  const [buttons, setButtons] = useState<JSX.Element[] | null>(null);
  const [sortcutsEnabled, setSortcutsEnabled] = useState(false);

  const sharedClasses = `min-w-[3rem] flex items-center justify-center h-10 border`;
  const activeClasses = `text-${style?.text.active.color} hover:text-${style?.text.active.hover.color} border-${style?.border.active.color} border-opacity-${style?.border.active.opacity} bg-${style?.background.active.color} bg-opacity-${style?.background.active.opacity} shadow-white-center`;
  const inactiveClasses = `text-${style?.text.inactive.color} hover:text-${style?.text.inactive.hover.color} border-${style?.border.inactive.color} border-opacity-${style?.border.inactive.opacity} bg-${style?.background.inactive.color} bg-opacity-${style?.background.inactive.opacity} hover:bg-${style?.background.inactive.hover.color} hover:bg-opacity-${style?.background.inactive.hover.opacity} hover:shadow-white-center hover:border-${style?.border.inactive.color} hover:border-opacity-${style?.border.inactive.opacity}`;

  useEffect(() => {
    let center = 2;
    let fields = 5;
    if (width < 480) {
      center = 1;
      fields = 3;
    }

    if (width < 300) {
      center = 0;
      fields = 1;
    }

    if (totalPages > fields) {
      setSortcutsEnabled(true);
    } else {
      setSortcutsEnabled(false);
    }
    const buttonList: JSX.Element[] = [];
    for (let i = 1; i < totalPages + 1; i++) {
      let min = Math.max(page - center, 1);
      let max = Math.min(page + center, totalPages + 1);

      if (page <= center) {
        min = 1;
        max = Math.min(fields, totalPages);
      } else if (page >= totalPages - center) {
        min = Math.max(totalPages - fields + 1, 1);
        max = totalPages;
      }

      if (i >= min && i <= max) {
        const roundedStart =
          i === min && totalPages <= fields ? ' rounded-s-lg' : '';
        const roundedEnd =
          i === max && totalPages <= fields ? ' rounded-e-lg' : '';
        buttonList.push(
          <li
            key={i}
            onClick={() => {
              setPage(i);
            }}
          >
            <a
              href="#"
              className={
                (i === page
                  ? twMerge(sharedClasses, activeClasses)
                  : twMerge(sharedClasses, inactiveClasses)) +
                roundedStart +
                roundedEnd
              }
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
            >
              {i}
            </a>
          </li>
        );
      }
      setButtons(buttonList);
    }
  }, [width, page, totalPages]);

  return (
    <div ref={navigationRef} className="w-full">
      <nav>
        <ul className="inline-flex -space-x-px text-base h-10">
          {sortcutsEnabled && (
            <>
              <li onClick={() => setPage(1)}>
                <a
                  href="#"
                  className={`flex items-center justify-center px-2 h-10 ms-0 text-${style?.text.active.color} bg-white/20 border border-e-0 border-white/30 rounded-s-lg hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-white/40`}
                >
                  <FastBackwardIcon />
                </a>
              </li>
              <li
                onClick={() => {
                  if (page > 1) {
                    setPage(page - 1);
                  }
                }}
              >
                <a
                  href="#"
                  className={`flex items-center justify-center px-2 h-10 text-${style?.text.active.color} bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-white/40`}
                >
                  <BackwardIcon />
                </a>
              </li>
            </>
          )}
          {buttons}
          {sortcutsEnabled && (
            <>
              <li
                onClick={() => {
                  if (page < totalPages) {
                    setPage(page + 1);
                  }
                }}
              >
                <a
                  href="#"
                  className={`flex items-center justify-center px-2 h-10 text-${style?.text.active.color} bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]`}
                >
                  <ForwardIcon />
                </a>
              </li>
              <li
                onClick={() => {
                  setPage(totalPages);
                }}
              >
                <a
                  href="#"
                  className={`flex items-center justify-center px-2 h-10 text-${style?.text.active.color} bg-white/20 border border-white/30 rounded-e-lg hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]`}
                >
                  <FastForwardIcon />
                </a>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;
