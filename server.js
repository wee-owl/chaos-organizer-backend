import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import * as crypto from "crypto";

const app = express();

app.use(cors());
app.use(
  bodyParser.json({
    limit: '50mb',
    type(req) {
      return true;
    },
  })
);
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

let messages = [
  {
    id: crypto.randomUUID(),
    author: 'bot',
    text: 'Привет! Я твой виртуальный помощник. Для выбора запроса введи команду /start.',
    time: null,
  },
];

app.use(async (request, response) => {
  const { method, type, id } = request.query;
  switch (method) {
    case "getList":
      response.send(JSON.stringify(messages)).end();
      break;
    case "createMessage": {
      try {
        const createData = request.body;
        const newMessage = {
          id: crypto.randomUUID(),
          author: createData.author,
          text: createData.text || null,
          fileName: createData.fileName || null,
          type: createData.type || null,
          url: createData.url || null,
          time: createData.time || null,
        };
        messages.push(newMessage);
        response.send(JSON.stringify(newMessage)).end();
      } catch (error) {
        response.status(500).send(JSON.stringify({ error: error.message }));
      }
      break;
    }
    case "messageType": {
      const message = messages.filter((message) => (message.type && message.type === type));
      if (!message) {
        response
          .status(404)
          .send(JSON.stringify({ message: "Not found" }))
          .end();
        break;
      }
      response.send(JSON.stringify(message)).end();
      break;
    }
    case "deleteById": {
      const message = messages.find((message) => message.id === id);
      if (message) {
        messages = messages.filter((message) => message.id !== id);
        response.status(204).end();
      } else {
        response
          .status(404)
          .send(JSON.stringify({ message: "Not found" }))
          .end();
      }
      break;
    }
    default:
      response.status(404).end();
      break;
  }
});

const port = process.env.PORT || 3000;
const bootstrap = async () => {
  try {
    app.listen(port, () =>
        console.log(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
