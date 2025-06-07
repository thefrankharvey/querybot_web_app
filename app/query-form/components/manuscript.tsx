import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FormState } from "../page";
import { ManuscriptProcessorStatus } from "@/app/hooks/use-manuscript-processor";

const Manuscript = ({
  form,
  setForm,
  manuscriptStatus,
  processManuscript,
}: {
  form: FormState;
  setForm: React.Dispatch<React.SetStateAction<FormState>>;
  manuscriptStatus: ManuscriptProcessorStatus;
  processManuscript: (file: File | null | undefined) => Promise<void>;
}) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const manuscript = acceptedFiles[0];
        setForm((prev) => ({ ...prev, manuscript }));
        await processManuscript(manuscript);
      }
    },
    [processManuscript, setForm]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  return (
    <div className="w-full">
      <label className="font-semibold block">Manuscript</label>

      <div
        {...getRootProps()}
        className={[
          "w-full mt-2 p-5 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors",
          isDragActive
            ? "bg-blue-50 border-blue-400"
            : "border-gray-300 bg-transparent",
        ].join(" ")}
      >
        <input {...getInputProps()} />
        {form.manuscript ? (
          <div>
            <p>
              Selected file: <strong>{form.manuscript.name}</strong>
            </p>
            {manuscriptStatus === "success" && (
              <p className="mt-2 text-green-600">
                Manuscript processed successfully
              </p>
            )}
            {manuscriptStatus === "error" && (
              <p className="mt-2 text-red-600">Error processing manuscript</p>
            )}
          </div>
        ) : (
          <p>
            {isDragActive
              ? "Drop your file here…"
              : "Drag & drop a document, or click to select"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Manuscript;
