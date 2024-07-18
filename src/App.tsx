import { useEffect, useRef, useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Plus, X } from "lucide-react";
import { webhook_url } from "../config.json";

function App() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState<File | undefined>(undefined);
  const [isPending, setIsPending] = useState(false);
  const [pollRequest, setPollRequet] = useState("");
  const [responses, setResponses] = useState<string[]>([""]);
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    if (pollRequest && responses[0]) {
      setImage(undefined);
      ref.current.value = "";
    }
  }, [pollRequest, responses]);

  const sendMessage = async () => {
    setIsPending(true);
    const body = new FormData();

    const payload_json: Record<string, unknown> = {
      content: message,
    };

    if (pollRequest && responses[0]) {
      setImage(undefined);
      payload_json["poll"] = {
        question: {
          text: pollRequest,
        },
        answers: responses.map((response, index) => ({
          answer_id: index,
          poll_media: { text: response },
        })),
      };
    }

    if (image) {
      body.set("files[0]", image);
      payload_json["attachment"] = [
        {
          id: 0,
          description: "Test",
          filename: image.name,
        },
      ];
    }

    body.set("payload_json", JSON.stringify(payload_json));

    fetch(webhook_url, {
      method: "POST",
      body,
    }).finally(() => {
      setImage(undefined);
      ref.current.value = "";
      setMessage("");
      setResponses([""]);
      setPollRequet("");
      setIsPending(false);
    });
  };

  return (
    <div className="flex w-full h-screen items-center justify-center">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Envoyer un message</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="text"
            placeholder="What is the message ?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isPending}
          />
          <Input
            type="file"
            disabled={isPending || (pollRequest && responses[0] ? true : false)}
            ref={ref}
            onChange={(e) => setImage(e.target.files?.[0])}
          />
          {image && <img src={URL.createObjectURL(image)} />}
          <hr />
          <h2 className="text-xl">Question</h2>
          <Input
            type="text"
            placeholder="Un sondage ?"
            value={pollRequest}
            onChange={(e) => setPollRequet(e.target.value)}
          />
          <h2 className="text-xl">Réponses</h2>
          {responses.map((response, index) => (
            <div className="flex flex-row gap-3">
              <Input
                type="text"
                placeholder={`Réponse ${index + 1}`}
                value={response}
                onChange={(e) => {
                  setResponses((prevResponses) => {
                    prevResponses[index] = e.target.value;
                    return [...prevResponses];
                  });
                }}
              />
              {responses.length > 1 && index !== 0 && (
                <Button
                  onClick={() => {
                    setResponses((prevResponses) => {
                      prevResponses.splice(index, 1);

                      return [...prevResponses];
                    });
                  }}
                >
                  <X />
                </Button>
              )}
            </div>
          ))}
          <Button
            className="flex gap-2"
            variant="secondary"
            onClick={() => {
              setResponses((prevResponses) => [...prevResponses, ""]);
            }}
          >
            <Plus />
            Ajouter une réponse
          </Button>
          <Button disabled={isPending} onClick={sendMessage}>
            Envoyer message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

export default App;
