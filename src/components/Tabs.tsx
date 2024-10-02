import { useState } from 'react';
import { IconType, getIcon } from './Icons';

interface TabsProps {
  items: Array<{ label: string; icon: IconType; content: React.ReactNode }>;
  onChange?: (activeTab: number) => void;
}

const Tabs = ({ items, onChange }: TabsProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const inactiveStyle =
    'inline-flex items-center justify-center p-4 border-b-2 border-transparent rounded-t-lg hover:text-white hover:border-white/50 group hover:drop-shadow-center';
  const activeStyle =
    'inline-flex items-center justify-center p-4 text-white border-b-2 border-white rounded-t-lg group active group';

  const inactiveIconStyle = 'w-4 h-4 me-2 text-white/50 group-hover:text-white';
  const activeIconStyle = 'w-4 h-4 me-2 text-white';

  return (
    <>
      <div className="flex justify-center m-2">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center text-white/75">
          {items.map((item, index) => {
            const Icon = getIcon(item.icon);

            return (
              <li
                key={index}
                className="me-2"
                onClick={() => {
                  setActiveTab(index);
                  if (typeof onChange === 'function') {
                    onChange(index);
                  }
                }}
              >
                <a
                  href="#"
                  className={activeTab === index ? activeStyle : inactiveStyle}
                >
                  <Icon
                    className={
                      activeTab === index ? activeIconStyle : inactiveIconStyle
                    }
                  />
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
      {items[activeTab].content}
    </>
  );
};

export default Tabs;
