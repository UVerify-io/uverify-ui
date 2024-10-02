import { useEffect, useRef, useState } from 'react';
import { useDimensions } from '../utils/hooks';
import {
  BackwardIcon,
  FastBackwardIcon,
  FastForwardIcon,
  ForwardIcon,
} from './Icons';

declare interface PaginationProps {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
}

const Pagination = ({ page, setPage, totalPages }: PaginationProps) => {
  const navigationRef = useRef<HTMLDivElement>(null);
  const { width } = useDimensions(navigationRef);
  const [buttons, setButtons] = useState<JSX.Element[] | null>(null);
  const [sortcutsEnabled, setSortcutsEnabled] = useState(false);

  const activeClasses =
    'min-w-[3rem] flex items-center justify-center h-10 text-white border border-white/75 bg-white/40 shadow-center shadow-white/50';
  const inactiveClasses =
    'min-w-[3rem] flex items-center justify-center h-10 text-white bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]';

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
                (i === page ? activeClasses : inactiveClasses) +
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
                  className="flex items-center justify-center px-2 h-10 ms-0 text-white bg-white/20 border border-e-0 border-white/30 rounded-s-lg hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]"
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
                  className="flex items-center justify-center px-2 h-10 text-white bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]"
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
                  className="flex items-center justify-center px-2 h-10 text-white bg-white/20 border border-white/30 hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]"
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
                  className="flex items-center justify-center px-2 h-10 text-white bg-white/20 border border-white/30 rounded-e-lg hover:bg-white/30 hover:shadow-center hover:shadow-white/50 hover:border-[#FFFFFF40]"
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
