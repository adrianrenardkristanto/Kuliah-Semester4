import { useEffect, useState } from "react";

type Post = {
    id: string;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
    updateAt: string; 
};

function App(){
    const [records, setRecords] = useState<Post[]>([]);
    const reloadData = async () => {
        const response = await fetch('https://ithb-pbp.hansyulian.online/post');
        const data = await response.json();
        setRecords(data.records as Post[]);
    }

    useEffect(() => {
        reloadData();
    }, []);

    const create = async (formData: Post) => {
        await fetch("https://ithb-pbp.hansyulian.online/post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData), 
        });
        reloadData();
    };
      
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch('https://ithb-pbp.hansyulian.online/post');
            const data = await response.json();
            setRecords(data.records as Post[]);
            console.log(data);
        };
        fetchData();
    }, []);

    return (
        <div>
            <div>
                <form action="POST">
                    <input type="text" name="title" placeholder="Title" />
                    <input type="text" name="content" placeholder="Content" />
                    <input type="text" name="authorName" placeholder="Author Name" />
                   <button
                        onClick={(e) => {
                            e.preventDefault(); 
                            const title = (document.querySelector('input[name="title"]') as HTMLInputElement)?.value;
                            const content = (document.querySelector('input[name="content"]') as HTMLInputElement)?.value;
                            const authorName = (document.querySelector('input[name="authorName"]') as HTMLInputElement)?.value;

                            create({
                            id: "",
                            title,
                            content,
                            authorName,
                            createdAt: new Date().toISOString(),
                            updateAt: new Date().toISOString(),
                            });
                        }}
                        >
                     Create
                    </button>
                </form>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Content</th>
                        <th>Author Name</th>
                        <th>Created At</th>
                        <th>Updated At</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map((record) => {
                        return (
                            <tr key={record.id}>
                                <td>{record.id}</td>
                                <td>{record.title}</td>
                                <td>{record.content}</td>
                                <td>{record.authorName}</td>
                                <td>{record.createdAt}</td>
                                <td>{record.updateAt}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table> 
        </div>
    );
}

export default App