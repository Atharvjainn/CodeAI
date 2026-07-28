'use client'
import { getusers } from "@/services/test";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 gap-5">
      <p className="mt-4 text-lg">
        Enter the problem you want to generate!!
      </p>
      <input placeholder="Enter the prompt to generate the problem" className="w-xl max-h-1/2 border"></input>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
        onClick={getusers}
      >
        Execute
      </button>
    </div>
  );
}
