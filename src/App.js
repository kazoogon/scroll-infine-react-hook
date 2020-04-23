import React, { useState, useRef, useCallback } from 'react'
import useBookSearch from './useBookSearch'

export default function App() {
  const [query, setQuery] = useState('');//setQuery関数が発動されると、queryの値が変更される
  const [pageNumber, setPageNumber] = useState(1);

  const {
    books,
    hasMore,
    loading,
    error
  } = useBookSearch(query, pageNumber);

  const observer = useRef()

  /**
   * useCallback()
   * 変数の変更を検知して、処理を実行する。ここではrefの値をobserveしている
   *
   * useMemo()もやってることは基本的に同じだが、userCallbackは関数自体を保存するのに比べ、useMemoは関数の結果を保存する。
   */
  const lastBookElementRef = useCallback(node => {
    if(loading) return;

    /**
     * 「Intersection（要素間交差）」を「Observe（監視）」するAPI, 第二引数に任意のDOMの交差を監視できる。defaultではviewport
     */
    observer.current = new IntersectionObserver(entries => {
      //取得しているデータの一番下の要素が見えるようになった && APIから取得してきたデータが存在する
      if(entries[0].isIntersecting && hasMore) {
        setPageNumber(prevPageNumber => prevPageNumber + 1)
      }
    })

    //もし要素が存在すれば(=APIからのデータがあれば)、監視開始
    if(node) observer.current.observe(node);
  });

  const handleSearch = (e) => {
    setQuery(e.target.value);
    setPageNumber(1)
  };

  return (
    <>
      <input type="text" value={query} onChange={handleSearch}/>
      {
        books.map((book, index) => {
          if (books.length === index + 1) { //取得している一番したの要素
            return <div ref={lastBookElementRef} key={index}>{book}</div>
          } else {
            return <div key={index}>{book}</div>
          }
        })
      }
      <div>{loading && '⬇⬇⬇ 👓👓👓 🙇🙇🙇 Loading 🙇🙇🙇 👓👓👓 ⬇⬇⬇'}</div>
      <div>{error && 'Error'}</div>
    </>
  )
}