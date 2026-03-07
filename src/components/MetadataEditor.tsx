import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { IconType, PlusIcon } from './Icons';
import IconButton from './IconButton';
import DynamicInput from './DynamicInput';
import { Field } from '@uverify/core';
import { sha256 } from 'js-sha256';

type FieldError = 'KEY' | 'VALUE' | 'BOTH';
type FieldErrors = { [key: number]: FieldError };

export type MetadataHandle = {
  metadata: (templateId: string) => string | undefined;
  reset: () => void;
  /** Returns the plain (un-hashed) values of all uv_url_* fields as URLSearchParams. */
  urlParams: () => URLSearchParams;
};

declare interface MetadataEditorProps {
  className?: string;
  layoutMetadata: { [key: string]: string };
}

const UrlParamBadge = () => (
  <span className="inline-flex items-center text-[9px] font-bold uppercase tracking-wider bg-white/30 border border-white/40 text-white rounded px-1.5 py-0.5 select-none whitespace-nowrap shadow-center shadow-white/50">
    URL
  </span>
);

const MetadataEditor = forwardRef<MetadataHandle, MetadataEditorProps>(
  ({ className, layoutMetadata }, ref) => {
    const [fields, setFields] = useState<Field[]>([]);
    const [layoutFields, setLayoutFields] = useState<Field[]>([]);
    const [error, setError] = useState<FieldErrors | false>(false);

    const resetLayoutFields = () => {
      const layoutFields = Object.entries(layoutMetadata).map(
        ([key, value]) => ({
          key,
          value: '',
          placeholder: value,
          layoutProp: true,
        })
      );
      setLayoutFields(layoutFields);
    };

    useEffect(() => {
      if (layoutMetadata) {
        resetLayoutFields();
      }
    }, [layoutMetadata]);

    useImperativeHandle(ref, () => ({
      metadata(templateId: string) {
        if (
          fields.length === 0 &&
          layoutFields.length === 0 &&
          templateId === 'default'
        ) {
          return '{}';
        }

        const fieldList = [...fields, ...layoutFields];
        if (templateId !== 'default') {
          fieldList.push({ key: 'uverify_template_id', value: templateId });
        }

        const result = tryToParseFields(fieldList);

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
        resetLayoutFields();
        setError(false);
      },
      urlParams() {
        const params = new URLSearchParams();
        for (const field of [...layoutFields, ...fields]) {
          if (field.key.startsWith('uv_url_') && field.value) {
            params.set(field.key.slice(7), field.value);
          }
        }
        return params;
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
          if (field.layoutProp) {
            if (field.key && field.value) {
              // uv_url_* layout fields: store the SHA-256 hash on-chain
              data[field.key] = field.key.startsWith('uv_url_')
                ? sha256(field.value)
                : parseFieldValue(field.value);
            }
          } else {
            if (!field.key && !field.value) {
              errors[index] = 'BOTH';
            } else if (!field.key) {
              errors[index] = 'KEY';
            } else if (!field.value) {
              errors[index] = 'VALUE';
            } else {
              // uv_url_* custom fields: store the SHA-256 hash on-chain
              data[field.key] = field.key.startsWith('uv_url_')
                ? sha256(field.value)
                : parseFieldValue(field.value);
            }
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
      const isUrlParam = field.key.startsWith('uv_url_');
      const displayKey = isUrlParam ? field.key.slice(7) : field.key;

      const hasKeyError =
        !field.layoutProp &&
        ((error && error[index] === 'KEY') ||
          (error && error[index] === 'BOTH'));
      const hasValueError =
        !field.layoutProp &&
        ((error && error[index] === 'VALUE') ||
          (error && error[index] === 'BOTH'));

      return (
        <div key={index} className="flex items-center my-1 gap-1">
          {/* Key - fixed width */}
          <div className="flex-none w-28">
            <input
              autoFocus={false}
              type="text"
              onBlur={(event) => {
                if (event.target.value === '') {
                  event.target.placeholder = 'Key';
                }
              }}
              readOnly={field.layoutProp}
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
                  : 'bg-white/25 border border-[#FFFFFF40] text-white'
              } focus:bg-white/30 focus:shadow-center focus:shadow-white/50`}
              value={hasKeyError ? 'Required field' : displayKey}
              placeholder="Key"
              disabled={field.layoutProp}
              onChange={(e) => {
                if (field.layoutProp) return;
                const updatedFields = [...fields];
                // Preserve uv_url_ prefix while user edits the display name
                updatedFields[index].key = isUrlParam
                  ? 'uv_url_' + e.target.value
                  : e.target.value;
                setFields(updatedFields);
              }}
            />
          </div>
          {/* Value - fills remaining space */}
          <div className="flex-1 min-w-0">
            <DynamicInput
              value={hasValueError ? 'Required field' : field.value}
              placeholder={field.placeholder || 'Value'}
              className={`placeholder-white/60 w-full h-10 text-xs text-white px-2 outline-hidden rounded focus:bg-white/30 focus:shadow-center focus:shadow-white/50 ${
                hasValueError
                  ? 'bg-red-500/25 border-2 border-red-500/75 text-white font-extrabold'
                  : 'bg-white/25 border border-[#FFFFFF40] text-white'
              }`}
              onBlur={(event) => {
                if (event.target.value === '') {
                  event.target.placeholder = field.placeholder || 'Value';
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
              onChange={(event) => {
                if (field.layoutProp) {
                  const updatedFields = [...layoutFields];
                  updatedFields[index].value = event.target.value;
                  setLayoutFields(updatedFields);
                } else {
                  const updatedFields = [...fields];
                  updatedFields[index].value = event.target.value;
                  setFields(updatedFields);
                }
              }}
            />
          </div>
          {/* Right actions - fixed width so all rows align */}
          <div className="flex-none w-20 flex items-center justify-start gap-1">
            {field.layoutProp ? (
              isUrlParam ? <UrlParamBadge /> : null
            ) : (
              <>
                <button
                  type="button"
                  title={
                    isUrlParam
                      ? 'Value is stored as a hash on-chain and revealed via a URL parameter. Click to disable.'
                      : 'Click to store the value as a hash on-chain and share it via a URL parameter (GDPR-friendly).'
                  }
                  onClick={() => {
                    const updatedFields = [...fields];
                    const current = updatedFields[index].key;
                    updatedFields[index].key = isUrlParam
                      ? current.slice(7)
                      : 'uv_url_' + current;
                    setFields(updatedFields);
                  }}
                  className={`text-[9px] uppercase tracking-wider rounded px-1.5 py-1 select-none whitespace-nowrap border transition-all duration-150 ${
                    isUrlParam
                      ? 'font-bold bg-white/30 border-white/40 text-white shadow-center shadow-white/50 hover:shadow-white/70'
                      : 'font-normal bg-white/25 border-[#FFFFFF40] text-white hover:shadow-center hover:shadow-white/20'
                  }`}
                >
                  URL
                </button>
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
              </>
            )}
          </div>
        </div>
      );
    };

    return (
      <div className={className}>
        {layoutFields.map((field, index) => renderField(field, index))}
        {fields.map((field, index) => renderField(field, index))}
        {addFieldButton}
      </div>
    );
  }
);
export default MetadataEditor;
