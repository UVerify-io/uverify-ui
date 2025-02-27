import { forwardRef, useImperativeHandle, useState } from 'react';
import { IconType, PlusIcon } from './Icons';
import IconButton from './IconButton';
import { Field } from '../common/types';

type FieldError = 'KEY' | 'VALUE' | 'BOTH';
type FieldErrors = { [key: number]: FieldError };

export type MetadataHandle = {
  metadata: () => string | undefined;
  reset: () => void;
};

declare interface MetadataEditorProps {
  className?: string;
}

const MetadataEditor = forwardRef<MetadataHandle, MetadataEditorProps>(
  ({ className }, ref) => {
    const [fields, setFields] = useState<Field[]>([]);
    const [error, setError] = useState<FieldErrors | false>(false);

    useImperativeHandle(ref, () => ({
      metadata() {
        if (fields.length === 0) {
          return '{}';
        }
        const result = tryToParseFields(fields);
        if (result) {
          if (typeof result === 'string') {
            return result;
          } else {
            setError(result);
            return undefined;
          }
        }
        return undefined;
      },
      reset() {
        setFields([]);
        setError(false);
      },
    }));

    const parseFieldValue = (value: string) => {
      let parsedValue: null | boolean | number | string = value;
      if (value.toLowerCase() === 'null') {
        parsedValue = null;
      } else if (value.toLowerCase() === 'true') {
        parsedValue = true;
      } else if (value.toLowerCase() === 'false') {
        parsedValue = false;
      } else if (/^\d+$/.test(value.trim())) {
        parsedValue = Number(value);
      }
      return parsedValue;
    };

    const tryToParseFields = (
      metadata: Field[]
    ): string | FieldErrors | false => {
      try {
        const data: { [key: string]: any } = {};
        let index = 0;
        const errors: FieldErrors = {};
        for (const field of metadata) {
          if (!field.key && !field.value) {
            errors[index] = 'BOTH';
          } else if (!field.key) {
            errors[index] = 'KEY';
          } else if (!field.value) {
            errors[index] = 'VALUE';
          } else {
            data[field.key] = parseFieldValue(field.value);
          }
          index++;
        }
        if (Object.keys(errors).length > 0) {
          return errors;
        }
        return JSON.stringify(JSON.parse(JSON.stringify(data)));
      } catch (e) {
        return false;
      }
    };

    const addFieldButton = (
      <div
        onClick={() => {
          setFields([...fields, { key: '', value: '' }]);
        }}
        className="mt-2 flex items-center justify-center w-full h-10 rounded-lg border border-[#FFFFFF40] cursor-pointer bg-white/25 transition duration-200 hover:shadow-center hover:shadow-white/20 hover:bg-white/40"
      >
        <PlusIcon />
        <p className="ml-2 text-white text-xs font-bold uppercase">
          Add metadata field
        </p>
      </div>
    );

    const renderField = (field: Field, index: number) => {
      const hasKeyError =
        (error && error[index] === 'KEY') || (error && error[index] === 'BOTH');
      const hasValueError =
        (error && error[index] === 'VALUE') ||
        (error && error[index] === 'BOTH');

      return (
        <div key={index} className="flex items-center my-1">
          <div className="flex w-2/5 flex-col mr-1">
            <input
              type="text"
              onBlur={(event) => {
                if (event.target.value === '') {
                  event.target.placeholder = 'Key';
                }
              }}
              onFocus={(event) => {
                event.target.placeholder = '';
                if (hasKeyError) {
                  const updatedErrors = { ...error };
                  if (updatedErrors[index] === 'BOTH') {
                    updatedErrors[index] = 'VALUE';
                  } else {
                    delete updatedErrors[index];
                  }
                  setError(updatedErrors);
                  const updatedFields = [...fields];
                  updatedFields[index].key = '';
                  setFields(updatedFields);
                }
              }}
              className={`placeholder-white/60 w-full h-10 text-xs px-2 outline-hidden rounded ${
                hasKeyError
                  ? 'bg-red-500/25 border-2 border-red-500/75 text-white font-extrabold'
                  : 'bg-white/25 border border-white/75 text-white'
              } focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
              value={hasKeyError ? 'Required field' : field.key}
              placeholder="Key"
              onChange={(e) => {
                const updatedFields = [...fields];
                updatedFields[index].key = e.target.value;
                setFields(updatedFields);
              }}
            />
          </div>
          <div className="flex w-3/5 flex-col mr-1">
            <input
              type="text"
              onBlur={(event) => {
                if (event.target.value === '') {
                  event.target.placeholder = 'Value';
                }
              }}
              onFocus={(event) => {
                event.target.placeholder = '';
                if (hasValueError) {
                  const updatedErrors = { ...error };
                  if (updatedErrors[index] === 'BOTH') {
                    updatedErrors[index] = 'KEY';
                  } else {
                    delete updatedErrors[index];
                  }
                  setError(updatedErrors);

                  const updatedFields = [...fields];
                  updatedFields[index].value = '';
                  setFields(updatedFields);
                }
              }}
              value={hasValueError ? 'Required field' : field.value}
              onChange={(e) => {
                const updatedFields = [...fields];
                updatedFields[index].value = e.target.value;
                setFields(updatedFields);
              }}
              placeholder="Value"
              className={`placeholder-white/60 w-full h-10 text-xs text-white px-2 outline-hidden rounded focus:bg-white/30 focus:shadow-center focus:shadow-white/50 ${
                hasValueError
                  ? 'bg-red-500/25 border-2 border-red-500/75 text-white font-extrabold'
                  : 'bg-white/25 border border-white/75 text-white'
              }`}
            />
          </div>
          <IconButton
            iconType={IconType.Minus}
            onClick={() => {
              const updatedFields = [...fields];
              updatedFields.splice(index, 1);
              setFields(updatedFields);
              const updatedErrors = { ...error };
              delete updatedErrors[index];
              setError(updatedErrors);
            }}
          />
        </div>
      );
    };

    return (
      <div className={className}>
        {fields.map((field, index) => renderField(field, index))}
        {addFieldButton}
      </div>
    );
  }
);
export default MetadataEditor;
