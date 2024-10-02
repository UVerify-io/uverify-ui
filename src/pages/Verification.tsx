import { useState } from 'react';
import Button from '../components/Button';
import Card from '../components/Card';
import Dropzone from '../components/Dropzone';
import Tabs from '../components/Tabs';
import { IconType } from '../components/Icons';
import TextArea from '../components/TextArea';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import { sha256 } from 'js-sha256';
import { toast } from 'react-toastify';
import SelectedFileArea from '../components/SelectedFileArea';
import Fingerprint from '../components/Fingerprint';

const Verification = () => {
  const [text, setText] = useState('');
  const [fileHash, setFileHash] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  const showFingerprint =
    (activeTab === 0 && fileHash !== '') ||
    (activeTab === 1 && text.length > 0);
  const hash = showFingerprint && (activeTab === 0 ? fileHash : sha256(text));

  const dropArea =
    typeof selectedFile === 'undefined' ? (
      <Dropzone
        className="min-h-[140px]"
        onDrop={(files: File[]) => {
          if (files.length === 0) return;
          if (files.length > 1) {
            toast.error('Please upload only one file.');
            return;
          }
          const file = files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === 'string') {
              setFileHash(sha256(result));
              setSelectedFile(file);
            }
          };
          reader.onerror = (event) => {
            toast.error(
              'There was an error reading the file. Please try again.'
            );
            console.error(event);
          };
          reader.readAsText(file);
        }}
      />
    ) : (
      <SelectedFileArea
        selectedFile={selectedFile}
        onRemove={() => {
          setSelectedFile(undefined);
          setFileHash('');
        }}
      />
    );

  return (
    <div className="flex flex-col text-center text-white max-w-screen-sm w-full pt-2 sm:pt-12 lg:max-w-screen-md">
      <Header title="Verify Data" />
      <Card className="mt-2 grow sm:mx-2 sm:mt-12 sm:grow-0 sm:mb-4">
        <h2 className="text-xl font-extrabold uppercase">Verify Data</h2>
        <h3 className="text-sm font-extrabold uppercase mb-4">
          Let's check the data fridge
        </h3>
        <p>
          Drop a file or enter some plain text to check if someone has submitted
          the same data before
        </p>

        <Tabs
          onChange={(index) => {
            setActiveTab(index);
          }}
          items={[
            {
              label: 'Upload File',
              icon: IconType.Upload,
              content: (
                <div className="flex items-center">
                  {dropArea}
                  {typeof hash === 'string' && <Fingerprint hash={hash} />}
                </div>
              ),
            },
            {
              label: 'Write Text',
              icon: IconType.Pen,
              content: (
                <div className="flex items-center">
                  <TextArea
                    rows={6}
                    className="min-h-[140px]"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  ></TextArea>
                  {typeof hash === 'string' && <Fingerprint hash={hash} />}
                </div>
              ),
            },
          ]}
        />

        <div className="flex items-center justify-center">
          <Button
            className="mt-4"
            label="Verify"
            variant="glass"
            color="blue"
            onClick={() => {
              if (activeTab === 0) {
                if (fileHash === '') {
                  toast.info('Please upload a file');
                  return;
                }
                navigate(`/verify/${fileHash}`);
              } else if (activeTab === 1) {
                if (text.length === 0) {
                  toast.info('Please enter some text');
                  return;
                }
                navigate(`/verify/${sha256(text)}`);
              }
            }}
          />
        </div>
      </Card>
    </div>
  );
};

export default Verification;
