import React from "react";

import { Check } from "lucide-react";

type FormESuccessProps = {
  message?: string;
};

const FormSuccess = ({ message }: FormESuccessProps) => {
  if (!message) return null;
  return (
    <div className="bg-green-400/15 p-3 rounded-md flex items-center gap-x-2 text-sm text-green-500">
      <Check className="w-4 h-4" />
      {message}
    </div>
  );
};

export default FormSuccess;
