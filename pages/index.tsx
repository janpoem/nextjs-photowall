import { ImagesList } from '@/components/ImagesList';
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const curPage = 1;

  const ref = useRef<HTMLDivElement | null>(null);
  const pagesRef = useRef<number[]>([]);

  const [nextPage, setNextPage] = useState<number | null>(curPage);
  const [appendNextPage, setAppendNextPage] = useState<number | null>(null);
  const [pages, setPages] = useState<number[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      if (nextPage == null) return;
      if (ref.current == null) return;
      if (ref.current.classList.contains('Loading')) return;
      if (window.scrollY + window.innerHeight >= ref.current.offsetTop) {
        ref.current.classList.add('Loading');
        setAppendNextPage(nextPage);
        if (!pagesRef.current.includes(nextPage)) {
          pagesRef.current.push(nextPage);
          setPages(pagesRef.current);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [nextPage]);

  const onLoad = () => {
    if (appendNextPage != null) {
      setAppendNextPage(null);
      setNextPage(appendNextPage + 1);
    }
    if (ref.current != null) {
      ref.current.classList.remove('Loading');
    }
  }

  return (
    <div className={'AppContainer'}>
      <ImagesList page={1} onLoad={onLoad}/>
      {pages.map(p => <ImagesList key={`imagesList:${p}`} page={p} onLoad={onLoad}/>)}
      <div ref={ref} className={'NextImages'}></div>
    </div>
  );
}
