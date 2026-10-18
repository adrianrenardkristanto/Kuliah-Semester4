import express, { json } from 'express';
import { v4 } from "uuid"; 

const app = express();
app.use(json());

type Task = {
    id: string;
    // dueDate: Date;
    title: string;
    description?: string;
    // value: number;
    // requireChecker: boolean;
}

const tasks: Task[] = [{
    id: "1",
    title: "Task 1",
    description: "This is the first task",
},
{
    id: "2",
    title: "Task 2",
    description: "This is the second task",
},
{
    id: "3",
    title: "Task 3",
    description: "This is the third task",
}
];

// app.get("/task", (req,res,next) => {
//     const title = req.query.title;
//     let filtereredTasks = tasks;
//     if (typeof title == 'string') {
//         filtereredTasks = filtereredTasks.filter((record) => record.title.includes(title))
//     }
//     // res.status(200).json({
//     //     tasks
//     // });

//     const description = req.query.description;
//     if (typeof description == 'string')  {
//         filtereredTasks = filtereredTasks.filter((record) => record.description.includes(description));
//     }

//     const minValueString = req.query.minValue as string;
//     const minValue = parseFloat(minValueString);
//     if (!isNaN(minValue)) {
//         filtereredTasks = filtereredTasks.filter((record) => record.value >= minValue);
//     }

//     const requireChecker = req.query.requireChecker;
//     if (requireChecker === 'true') {
//         filtereredTasks = filtereredTasks.filter((record) => record.requireChecker === true);
//     }
//     res.status(200).json(filtereredTasks);
// });

// app.get("/task/:id", (req,res,next) => {
//     const task = tasks.find((record) => record.id === parseInt(req.params.id));
//     if (!task) {
//         res.status(404).json({ message: "Task not found" });
//         return;
//     }

//     res.status(200).json(task);
// });

app.post("/task/", (req, res, next) => {
    const {title, description} = req.body;
    const newTask: Task = {
        id: v4(),
        title, 
        description
    };
    tasks.push(newTask);
    res.status(200).json(newTask);
});

app.put("/task/:id", (req, res, next) =>{
    const id = req.params.id;
    const {title, description} = req.body;
    const record = tasks.find((record) => record.id === id);
    if (!record) {
        res.status(500).json({
            message: "Task not found"
        });
        return;
    }
    record.title = title;
    record.description = description;
    res.status(200).json(record);
});

app.delete("/task/:id", (req, res, next) => {
    const id = req.params.id;
    const index = tasks.findIndex((record) => record.id === id);
    if (index === -1) {
        res.status(500).json({
            message: "Task not found"
        });
        return;
    }
    tasks.splice(index, 1);
    res.status(200).json({ message: "Task deleted" });
});


app.get("/task", (req, res) => {
    res.status(200).json(tasks);
});

app.listen(3000, () => {
    console.log("App started at port 3000");
});