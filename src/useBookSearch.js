import { useEffect, useState } from 'react'
import axios from 'axios'

export default function useBookSearch(query, pageNumber) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [books, setBooks] = useState([]);

  /**
   * userEffectはrenderingされるたびに呼び出される。第二引数指定すると、その値が変更された時のみ実行される
   *
   * useEffect は描画を止めないで処理するから、一瞬処理できてない物が写る可能性ある。useLayoutEffect は描画止めるからその心配が無い
   * 基本的にuseEffect使用して、問題あればuseLayoutEffect
   */
  useEffect(() => {
    setLoading(true)
    setError(false)
    let cancel;

    axios({
      method: 'GET',
      url: 'http://openlibrary.org/search.json',
      params: {q: query, page: pageNumber},
      cancelToken: new axios.CancelToken(c => cancel = c)//keyboard打つたびにrequest送るのを阻止する
    }).then(res => {
      setBooks(prevBooks => {
        //Set()でここでは値の重複を阻止している
        return [...new Set([...prevBooks, ...res.data.docs.map(book => book.title)])]
      })
      setHasMore(res.data.docs.length > 0)
      setLoading(false);
    }).catch(e=> {
      if (axios.isCancel(e)) return;
      setError(true)
    })

    return () => cancel();//**ここはcomponentWillUnmount()と同じ
  }, [query, pageNumber]);

  return { loading, error, books, hasMore }
}
