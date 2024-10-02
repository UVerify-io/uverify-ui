import { useEffect, useState } from 'react';
import { Field } from '../common/types';
import IconButton from './IconButton';
import { IconType } from './Icons';
import { toast } from 'react-toastify';

declare interface JsonViewerProps {
  json: Record<string, string | number | boolean | null>;
  className?: string;
}

declare interface Row {
  content: Field;
  collapsed: boolean;
}

const JsonViewer = ({ json, className }: JsonViewerProps) => {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const parsedRows: Row[] = [];
    for (const key in json) {
      parsedRows.push({
        content: { key, value: (json[key] || '') + '' },
        collapsed: true,
      });
    }
    setRows(parsedRows);
  }, [json]);

  const renderRow = (row: Row, index: number) => {
    const field = row.content;
    return (
      <div key={index} className="flex my-1">
        <div className="flex w-3/12 flex-col mr-1">
          <input
            onDoubleClick={() => {
              navigator.clipboard.writeText(field.key);
              toast.success('Copied to clipboard');
            }}
            type="text"
            className={`cursor-pointer w-full h-10 text-xs px-2 outline-none rounded bg-white/25 border border-[#FFFFFF40] text-white hover:bg-white/30 hover:shadow-center hover:shadow-white/50`}
            value={field.key}
            readOnly
          />
        </div>
        <div className="flex w-9/12 flex-col mr-1">
          {row.collapsed ? (
            <div className="flex">
              <input
                onDoubleClick={() => {
                  navigator.clipboard.writeText(field.value);
                  toast.success('Copied to clipboard');
                }}
                type="text"
                className={`cursor-pointer grow h-10 text-xs px-2 outline-none rounded bg-white/25 border border-[#FFFFFF40] text-white hover:bg-white/30 hover:shadow-center hover:shadow-white/50`}
                value={
                  field.value.length > 50
                    ? field.value.slice(0, 50) + '...'
                    : field.value
                }
                readOnly
              />
              {field.value.length > 50 && (
                <IconButton
                  size="sm"
                  onClick={() => {
                    const updatedRows = [...rows];
                    updatedRows[index].collapsed = false;
                    setRows(updatedRows);
                  }}
                  className="ml-1"
                  iconType={IconType.AngleDown}
                />
              )}
            </div>
          ) : (
            <div className="flex">
              <div
                onDoubleClick={() => {
                  navigator.clipboard.writeText(field.value);
                  toast.success('Copied to clipboard');
                }}
                className={`cursor-pointer grow break-all text-left resize-none text-xs text-white p-2.5 outline-none rounded hover:bg-white/30 hover:shadow-center hover:shadow-white/50 bg-white/25 border border-[#FFFFFF40]`}
              >
                {field.value}
              </div>
              <div className="ml-1">
                <IconButton
                  size="sm"
                  iconType={IconType.Copy}
                  onClick={() => {
                    navigator.clipboard.writeText(field.value);
                    toast.success('Copied to clipboard');
                  }}
                />
                <IconButton
                  size="sm"
                  onClick={() => {
                    const updatedRows = [...rows];
                    updatedRows[index].collapsed = true;
                    setRows(updatedRows);
                  }}
                  iconType={IconType.AngleUp}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={className}>
      {rows.map((row, index) => renderRow(row, index))}
    </div>
  );
};

export default JsonViewer;
