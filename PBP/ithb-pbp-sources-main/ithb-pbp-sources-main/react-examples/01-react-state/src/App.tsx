import { useEffect, useState } from "react";

type Post = {
  id: string;
  title: string;
  content: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
};

function App() {
  const [records, setRecords] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");

  const reloadData = async () => {
    // const response = await fetch("http://ithb-pbp.hansyulian.online/post");
    const response = await fetch("http://localhost:5173/api/post");
    const data = await response.json();
    setRecords(data.records as Post[]);
  };

  useEffect(() => {
    reloadData();
  }, []);

  const create = async () => {
    await fetch("http://localhost:5173/api/post", {
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        title,
        content,
        authorName,
      }),
      method: "POST",
    });
    // reload data....
    reloadData();
    setTitle("");
    setContent("");
    setAuthorName("");
  };

  return (
    <div>
      <div>
        <table>
          <tbody>
            <tr>
              <td>Title</td>
              <td>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Content</td>
              <td>
                <input
                  type="text"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>Author</td>
              <td>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </td>
            </tr>
            <tr>
              <td>
                <button onClick={create}>Create</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <hr />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Content</th>
            <th>Author</th>
            <th>Created At</th>
            <th>Updated At</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.id}</td>
              <td>{record.title}</td>
              <td>{record.content}</td>
              <td>{record.authorName}</td>
              <td>{new Date(record.createdAt).toLocaleString()}</td>
              <td>{new Date(record.updatedAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
