import { useState } from 'react'
import './App.css'

// function App() {
//   const [value1, setValue1] = useState("");
//   const [value2, setValue2] = useState("");
//   // const [operation, setOperation] = useState('+');

//   var num1 = parseInt(value1) || 0;
//   var num2 = parseInt(value2) || 0;
//   var hasil = num1 + num2;

//   if (isNaN(num1) || isNaN(num2)) {
//     hasil = 0;
//   }
  
//   console.log("v1", value1, "v2", value2, "result", hasil);
  
//   return (
//     <>
//       <input value = {value1} onChange = {(e) => setValue1(e.target.value)} />
//       +
//       <input value = {value2} onChange = {(e) => setValue2(e.target.value)} />=
//       {hasil}
//     </>
//   )
// }

type Task = {
  title: string;
};

function App(){
  const [title, setTitle] = useState('');
  const [tasks, setTasks] = useState<Task[]>([
    {
      title: "Task 1"
    }, 
    {
      title: "Task 2"
    }
  ]);

  // const elements = [];
  // for(const task of tasks){
  //   elements.push(<div>{task.title}</div>);
  // }

  const addTask = () => {
    setTasks((prev) => [...prev, {title}]);
    setTitle("");
  }

  const deleteTask = (task: Task) => {
    setTasks((prev) => prev.filter((t) => t.title !== task.title));
  }

  const updateTask = (task: Task, formData: Task) => {
    setTasks((prev) => prev.map(
    (t) => t === task? formData : t)
  );
  };

  return (
  <> 
    <h1>Task List</h1>
    <div>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button onClick = {addTask}>Add Task</button>
    </div>
    <br />
    {tasks.map((task) => {
      // return (
      // // <div>{task.title}</div>
      // <div>
      //   {task.title}
      //   <button onClick={() => deleteTask(task)}>Delete</button>
      // </div>
      // )
      return (
        <TaskRow 
        task = {task} 
        onDelete={() => deleteTask(task)}
        onSave={(formData) => updateTask(task, formData)}></TaskRow>
      );
    })}
    {/* {elements} */}
  </>
  )
}

type TaskRowProps = {
  task: Task;
  onDelete: () => void;
  onSave: (task:Task) => void;
};

function  TaskRow(props: TaskRowProps){
  const { task, onDelete, onSave } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);


  const save = () => {
    onSave({...task, title});
    setIsEditing(false);
  };

  return (
    <div>
      {!isEditing && (
        <span>
          {task.title}
          <button
            onClick={() => {
              setIsEditing(true);
              setTitle(task.title); // penting kalau task bisa berubah
            }}
            >
          Edit
          </button>
        </span>
      )}
      {isEditing && (
        <span>
          <input value={title} onChange={(e)=> {setTitle(e.target.value)}}/>
          <button onClick={save}>Save</button>
          <button
            onClick={() => {
              setTitle(task.title); 
              setIsEditing(false); 
            }}
          >
          Cancel
          </button>
        </span>
      )}
      <button onClick={onDelete}>Delete</button>
    </div>
  );
  
}

export default App
