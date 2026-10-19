import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";
import { message } from "../utils/format";
function useData(path) {
  const [data, setData] = useState(null), [error, setError] = useState(""), [loading, setLoading] = useState(true), [version, setVersion] = useState(0);
  const reload = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    api(path).then((d) => {
      if (live) setData(d);
    }).catch((e) => {
      if (live) setError(message(e));
    }).finally(() => {
      if (live) setLoading(false);
    });
    return () => {
      live = false;
    };
  }, [path, version]);
  return { data, error, loading, reload };
}
export {
  useData
};
