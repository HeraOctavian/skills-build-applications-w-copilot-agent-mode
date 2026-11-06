import { useEffect, useState, type ReactNode } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  endpoint: string;
  emptyMessage: string;
  isEmpty: (data: T) => boolean;
  renderData: (data: T) => ReactNode;
};

type LoadState<T> = { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; data: T };

export function CapabilityCard<T>({ title, description, endpoint, emptyMessage, isEmpty, renderData }: Props<T>) {
  const [state, setState] = useState<LoadState<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    getJson<T>(endpoint)
      .then((data) => { if (active) setState({ status: 'success', data }); })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', message: error instanceof Error ? error.message : 'Unable to load data.' });
      });
    return () => { active = false; };
  }, [endpoint]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}...</p>}
        {state.status === 'error' && <p role="alert">Unable to load {title.toLowerCase()}: {state.message}</p>}
        {state.status === 'success' && (isEmpty(state.data) ? <p role="status">{emptyMessage}</p> : renderData(state.data))}
      </div>
    </section>
  );
}
