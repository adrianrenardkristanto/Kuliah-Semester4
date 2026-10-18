import { useCallback, useEffect, useMemo, useState } from "react";
import { invalidHookUsage, useValidHookUsage } from "./functionHookUsage";

type Post = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

function App() {
  const [records, setRecords] = useState<Post[]>();
  const [selectedRecord, setSelectedRecord] = useState<Post>();
  const [ready, setReady] = useState(false);

  const reloadData = useCallback(async () => {
    console.log("reload data called");
    if (!ready) return;
    console.log("reloading data");
    // const response = await fetch("http://ithb-pbp.hansyulian.online/post");
    const response = await fetch("http://localhost:5173/api/post");
    const data = await response.json();
    setRecords(data.records as Post[]);
  }, [ready]);

  // bugged, not recalculating thus not triggering any depedencies recalculation
  // const reloadData = useCallback(async () => {
  //   console.log("reload data called");
  //   if (!ready) return;
  //   console.log("reloading data");
  //   // const response = await fetch("http://ithb-pbp.hansyulian.online/post");
  //   const response = await fetch("http://localhost:5173/api/post");
  //   const data = await response.json();
  //   setRecords(data.records as Post[]);
  // },[]);

  // useEffect(callback: ()=>T, dependencyArray: any[]);
  // useMemo(callback: ()=>T, dependencyArray: any[]);
  // useCallback(callback: ()=>T, dependencyArray: any[]);
  useEffect(() => {
    console.log("use effect reload data");
    reloadData();
  }, [reloadData]);

  useEffect(() => {
    setTimeout(() => {
      setReady(true);
    }, 1000);
  }, []);
  console.log(ready, records);

  const someRecords = useMemo(() => {
    if (!records) {
      return [];
    }
    return records.slice(0, 10);
  }, [records]);

  // this is the condition return
  if (!records) return <div>Loading</div>;
  // just fine
  // invalidHookUsage();
  // invalid use of hook
  // useValidHookUsage();
  // rules of hooks
  // const [selectedRecord, setSelectedRecord] = useState<Post>();

  // rules of hooks
  // exhaustive dependency
  // const someRecords = useMemo(() => {
  //   return records.slice(0, 10);
  // }, []);

  return (
    <div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
            <th>Author</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {someRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.title}</td>
              <td>{record.content}</td>
              <td>{record.authorName}</td>
              <td>{new Date(record.createdAt).toLocaleString()}</td>
              <td>{new Date(record.updatedAt).toLocaleString()}</td>
              <td>
                <button onClick={() => setSelectedRecord(record)}>
                  Select
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedRecord && <div>Selected Record: {selectedRecord.title}</div>}
    </div>
  );
}

export default App;
