import { useEffect, useRef, useState, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { Save, Play, X, FileText } from "lucide-react";

import {
  getFile,
  saveFile,
  runFile,
} from "../api/workspace";

import { useToast } from "../hooks/useToast";


interface Props {
  path: string;
  onSave?: () => void;
  onRun?: () => void;
  onClose?: () => void;
}


export default function FileViewer({
  path,
  onSave,
  onRun,
  onClose,
}: Props) {

  const [content, setContent] = useState("");
  const [language, setLanguage] = useState("plaintext");

  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  const [runOutput, setRunOutput] = useState("");
  const [showOutput, setShowOutput] = useState(false);

  const editorRef = useRef<any>(null);

  const { toast } = useToast();


  const detectLanguage = useCallback((filePath:string)=>{

    const ext = filePath.split(".").pop()?.toLowerCase();

    const map:Record<string,string> = {
      py:"python",
      ts:"typescript",
      tsx:"typescript",
      js:"javascript",
      jsx:"javascript",
      json:"json",
      css:"css",
      html:"html",
      md:"markdown",
      txt:"plaintext",
      yaml:"yaml",
      yml:"yaml"
    };

    return map[ext || ""] || "plaintext";

  },[]);



  useEffect(()=>{

    if(!path){
      setContent("");
      return;
    }


    async function loadFile(){

      try{

        const data = await getFile(path);

        setContent(data.content ?? "");
        setLanguage(detectLanguage(path));

      }
      catch(error){

        console.error("File load error:", error);

        toast(
          "error",
          "Unable to load file"
        );

      }

    }


    loadFile();


  },[path, detectLanguage, toast]);





  async function handleSave(){

    if(!path)
      return;


    try{

      setSaving(true);

      await saveFile(
        path,
        content
      );


      toast(
        "success",
        "Saved"
      );

      onSave?.();


    }
    catch(error){

      console.error(error);

      toast(
        "error",
        "Save failed"
      );

    }
    finally{

      setSaving(false);

    }

  }





  async function handleRun(){

    if(!path)
      return;


    try{

      setRunning(true);
      setShowOutput(true);
      setRunOutput("Running...");


      const result = await runFile(path);


      if(result.success){

        setRunOutput(
          result.output || "Program finished with no output"
        );

      }
      else{

        setRunOutput(
          result.error || "Unknown execution error"
        );

      }


      onRun?.();


    }
    catch(error){

      setRunOutput(
        String(error)
      );

    }
    finally{

      setRunning(false);

    }

  }





  function handleEditorMount(editor:any){

    editorRef.current = editor;

  }





  if(!path){

    return (

      <div className="file-viewer empty">

        <div className="welcome-screen">

          <FileText size={64}/>

          <h2>
            Welcome to Agentic Coding Agent
          </h2>

          <p>
            Select a file from workspace
          </p>

        </div>

      </div>

    );

  }





  return (

    <div className="file-viewer">


      <div className="editor-header">


        <div className="file-info">

          <FileText size={16}/>

          <span className="file-path">
            {path}
          </span>

        </div>



        <div className="editor-actions">


          <button
            className="icon-btn"
            disabled={saving}
            onClick={handleSave}
          >

            <Save size={16}/>
            Save

          </button>




          <button
            className="icon-btn accent"
            disabled={running}
            onClick={handleRun}
          >

            <Play size={16}/>
            Run

          </button>




          {
            onClose &&
            <button
              className="icon-btn"
              onClick={onClose}
            >

              <X size={16}/>

            </button>
          }


        </div>


      </div>





      <div className="editor-container">


        <Editor

          key={path}

          height="100%"

          language={language}

          value={content}

          onChange={(value)=>{

            setContent(
              value ?? ""
            );

          }}


          onMount={handleEditorMount}


          theme="vs-dark"


          options={{

            automaticLayout:true,

            minimap:{
              enabled:true
            },

            fontSize:14,

            wordWrap:"on",

            scrollBeyondLastLine:false,

            lineNumbers:"on",

            readOnly:false

          }}

        />


      </div>





      {
        showOutput &&

        <div className="output-panel">


          <div className="output-header">

            <span>
              Output
            </span>


            <button
              className="icon-btn small"
              onClick={()=>setShowOutput(false)}
            >

              <X size={14}/>

            </button>


          </div>



          <pre className="output-content">
            {runOutput}
          </pre>


        </div>

      }



    </div>

  );

}