import { useForm } from "react-hook-form";
import YAML from "js-yaml";
import { useNavigate } from "react-router-dom";

type FormData = {
  harnessName: string;
  connectorA: string;
  connectorB: string;
  wireCount: number;
};

export default function Edit() {
  const { register, handleSubmit } = useForm<FormData>();
  const navigate = useNavigate();

  const onSubmit = async (data: FormData) => {
  const yamlObj = {
    metadata: {
      title: data.harnessName,
    },
    connectors: {
      A: { type: data.connectorA },
      B: { type: data.connectorB },
    },
    cables: {
      C1: {
        wirecount: data.wireCount,
        colors: Array(data.wireCount).fill("RD"),
      },
    },
  };

  const yamlStr = YAML.dump(yamlObj);
  
  console.log("--- YAML being sent ---\n" + yamlStr);

  // Save YAML to session storage
  sessionStorage.setItem("lastYaml", yamlStr);
  // Create FormData
  const formData = new FormData();
  // Append the YAML as a "file"
  formData.append(
    "yml_file",
    new Blob([yamlStr], { type: "text/yaml" }),
    "harness.yml"
  );

const res = await fetch(import.meta.env.VITE_API_URL + "/render", {
  method: "POST",
  headers: {
    Accept: "text/html"
  },
  body: formData,
});


  const html = await res.text();
  sessionStorage.setItem("lastHtml", html);
  navigate("/preview");
};

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2>Create Loom Drawing</h2>
      <label>Harness Name</label>
      <input {...register("harnessName")} />
      <label>Connector A</label>
      <input {...register("connectorA")} />
      <label>Connector B</label>
      <input {...register("connectorB")} />
      <label>Wire Count</label>
      <input type="number" {...register("wireCount")} />
      <button type="submit">Create Loom Drawing</button>
    </form>
  );
}
