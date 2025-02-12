import { errMsg } from './error';
import { notEmptyStr } from './infer';

// type HeadersInit = [string, string][] | Record<string, string> | Headers;
type HeadersAry = [string, string];

const toHeadersAry = (it: HeadersInit): HeadersAry[] => {
  if (Array.isArray(it)) return it;
  else if (it instanceof Headers) {
    // @ts-ignore
    return Array.from(it.entries());
  } else {
    return Object.entries(it);
  }
};

const mergeHeaders = (
  a: HeadersInit | undefined | null,
  b: HeadersInit | undefined | null,
): HeadersInit | undefined => {
  if (a == null) return b || undefined;
  if (b == null) return a || undefined;
  const headers = a instanceof Headers ? a : new Headers(a);
  toHeadersAry(b).forEach(([k, v]) => {
    headers.set(k, v);
  });
  return headers;
};

export type ResponseRetrieve<Result> = (
  resp: Response,
) => Result | Promise<Result>;

export type ResponseValidate<Result> = (res: unknown) => res is Result;

export type ResponseResolve<Result> = (
  res: Result | PromiseLike<Result>,
) => void;

export type ResponseTransform<Result, T> = (res: Result) => T | Promise<T>;

export type ResponseReject = (reason?: unknown) => void;

export type RequestOptions<R = unknown, T = R> = {
  fetch?: Omit<RequestInit, 'headers' | 'method' | 'body'>;
  method?: RequestInit['method'];
  headers?: HeadersInit;
  retrieve?: ResponseRetrieve<R>;
  validate?: ResponseValidate<R>;
  transform?: ResponseTransform<R, T>;
  json?: unknown;
  body?: BodyInit;
};

export type ResponseHandleParams<R = unknown, T = R> = {
  url: string | URL;
  req: RequestInit;
  resp: Response;
  opts: RequestOptions<R, T>;
  resolve: ResponseResolve<T>;
  reject: ResponseReject;
};

export type ResponseHandle = <R = unknown, T = R>(
  params: ResponseHandleParams<R, T>,
) => void | Promise<void>;

export type InitFetchOptions = {
  baseUrl?: string;
  headers?: Record<string, string> | HeadersAry[] | null;
  handle?: ResponseHandle;
};

export const initFetch = ({
  baseUrl: initBaseUrl,
  headers: initHeaders,
  handle,
}: InitFetchOptions) => {
  let baseUrl = '';
  let basicHeaders: HeadersAry[] = [];
  let responseHandle: ResponseHandle | undefined = handle;

  const setBaseUrl = (url?: string | null) => {
    if (notEmptyStr(url)) {
      if (url === '/') url = '';
      else if (url.endsWith('/')) url = url.replace(/\/+$/gi, '');
    }
    baseUrl = notEmptyStr(url) ? url : '';
  };

  const purgeUrl = (url: string) => {
    if (notEmptyStr(url)) {
      if (url === '/') url = '';
      else if (url.startsWith('/')) {
        url = url.replace(/^\/+/gi, '');
      }
    }
    return url;
  };

  const urlOf = (url: string) => {
    url = purgeUrl(url);
    const withProtocol = url.match(/^\w+:\/\//gi) != null;
    if (withProtocol) return url;
    return baseUrl + (url ? '/' + url : '');
  };

  const setBasicHeaders = (
    headers?: Record<string, string> | HeadersAry[] | null,
  ) => {
    if (headers == null) {
      basicHeaders = [];
    } else if (Array.isArray(headers)) {
      basicHeaders = basicHeaders.concat(headers);
    } else {
      Object.entries(headers).forEach(([key, value]) => {
        if (!notEmptyStr(key)) return;
        const idx = basicHeaders.findIndex(it => it[0] === key);
        if (value === null) {
          if (idx > -1) basicHeaders.splice(idx, 1);
        } else {
          if (idx > -1) {
            basicHeaders[idx] = [key, value];
          } else {
            basicHeaders.push([key, value]);
          }
        }
      });
    }
  };

  const initRequest = <R = unknown, T = R>(
    basic: RequestOptions<R, T> | null | undefined,
    iOpts?: ResponseValidate<R> | RequestOptions<R, T> | null,
  ): RequestOptions<R, T> => {
    const opts =
      iOpts == null
        ? {}
        : typeof iOpts === 'function'
          ? { validate: iOpts }
          : iOpts;

    if (basic == null) return opts;
    return {
      ...opts,
      ...basic,
      headers: basic.headers
        ? mergeHeaders(basic.headers, opts.headers)
        : opts.headers,
    };
  };

  const _fetch = <R = unknown, T = R>(
    pathOrUrl: string,
    opts: RequestOptions<R, T>,
  ) =>
    new Promise<T>((resolve, reject) => {
      const url = urlOf(pathOrUrl);
      const method = (opts.method || 'GET').toUpperCase();

      let headers = [
        opts.json ? ['Content-Type', 'application/json'] : undefined,
      ].filter(Boolean) as HeadersAry[];

      if (basicHeaders.length > 0) {
        headers = headers.concat(basicHeaders);
      }

      let body: BodyInit | undefined = opts.body;
      if (opts.json) {
        body = JSON.stringify(opts.json);
      }

      const req = {
        ...(opts.fetch || {}),
        method,
        headers:
          headers.length > 0
            ? mergeHeaders(headers, opts.headers)
            : opts.headers,
        body,
      };

      fetch(url, req)
        .then(resolveResponse(url, req, opts, resolve, reject))
        .catch(reject);
    });

  const resolveResponse =
    <R = unknown, T = R>(
      url: string,
      req: RequestInit,
      opts: RequestOptions<R, T>,
      resolve: ResponseResolve<T>,
      reject: ResponseReject,
    ) =>
    async (resp: Response) => {
      if (responseHandle != null) {
        return responseHandle({ url, req, resp, opts, resolve, reject });
      }
      // 以下是标准 http rest 的处理应答机制的 resolve response
      try {
        const res =
          typeof opts.retrieve === 'function'
            ? await opts.retrieve(resp)
            : await resp.json();
        try {
          if (resp.ok) {
            if (typeof opts.validate === 'function' && !opts.validate(res)) {
              return reject(new Error('无效的接口数据'));
            }
            if (typeof opts.transform === 'function') {
              return resolve(opts.transform(res) as T);
            }
            return resolve(res as T);
          } else {
            const msg =
              errMsg(res) ||
              `无效的 Http 状态码：${resp.status} - ${resp.statusText}`;
            if (resp.status === 401) {
              document.dispatchEvent(
                new CustomEvent('Unauthorized', {
                  detail: { reason: msg },
                }),
              );
            }
            return reject(msg);
          }
        } catch (err) {
          return reject(`处理响应结果出错：${errMsg(err)}`);
        }
      } catch (err) {
        return reject(`提取响应结果出错：${errMsg(err)}`);
      }
    };

  const reqPost = <R = unknown, T = R>(
    url: string,
    data?: unknown,
    opts?: ResponseValidate<R> | RequestOptions<R, T> | null,
  ) =>
    _fetch<R, T>(url, initRequest({ method: 'POST', json: data || {} }, opts));

  const reqRawPost = <R = unknown, T = R>(
    url: string,
    opts?: RequestOptions<R, T> | null,
  ) => _fetch<R, T>(url, initRequest({ ...opts, method: 'POST' }));

  const reqPut = <R = unknown, T = R>(
    url: string,
    data?: unknown,
    opts?: ResponseValidate<R> | RequestOptions<R, T> | null,
  ) =>
    _fetch<R, T>(url, initRequest({ method: 'PUT', json: data || {} }, opts));

  const reqGet = <R = unknown, T = R>(
    url: string,
    opts?: ResponseValidate<R> | RequestOptions<R, T> | null,
  ) => _fetch<R, T>(url, initRequest({ method: 'GET' }, opts));

  const reqDelete = <R = unknown, T = R>(
    url: string,
    data?: unknown,
    opts?: ResponseValidate<R> | RequestOptions<R, T> | null,
  ) =>
    _fetch<R, T>(
      url,
      initRequest({ method: 'DELETE', json: data || {} }, opts),
    );

  ///////////////////////////
  // init
  ///////////////////////////

  setBaseUrl(initBaseUrl);

  if (initHeaders != null) {
    setBasicHeaders(initHeaders);
  }

  return {
    get baseUrl() {
      return baseUrl;
    },
    setBaseUrl,
    urlOf,
    get basicHeaders() {
      return basicHeaders.slice();
    },
    setBasicHeaders,
    initRequest,
    fetch: _fetch,
    get: reqGet,
    post: reqPost,
    rawPost: reqRawPost,
    put: reqPut,
    delete: reqDelete,
  };
};
