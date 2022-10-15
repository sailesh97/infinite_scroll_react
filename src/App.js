import { useState, useRef, useCallback } from "react";
import useBookSearch from "./useBookSearch";

function App() {
  const [query, setQuery] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  
  const {loading, error, books, hasMore} = useBookSearch(query, pageNumber);

  const observer = useRef(); // #nullRef
  const lastBookElementRef = useCallback(node => {
    if(loading) return;
    if(observer.current) observer.current.disconnect()
    /** 
     * If check is neccessary as in 1st load observer will be null at #nullRef 
     * 
     * Disconnecting old bookElementRef, so that we can connect the new lastBookElement with ref properly.
     * 
     * */
    
    observer.current = new IntersectionObserver(entries => {
      // entries[0].isIntersecting will be true only when you visit the last book element rendered in page.
      if(entries[0].isIntersecting && hasMore) {
        console.log('Visible');
        setPageNumber(prevPageNumber => prevPageNumber + 1)
      }
    })
    if(node) observer.current.observe(node)
  }, [loading, hasMore]);

  function handleSearch(e){
    setQuery(e.target.value);
    setPageNumber(1)
  }


  return (
    <>
      <input type='text' value={query} onChange={handleSearch}/>
      {books.map((book, index) => {
        if(books.length === index+1){
          return <div ref={lastBookElementRef} key={book}>{book}</div> 
        } else{
          return <div key={book}>{book}</div>
        }
      })}

      <div>{loading && 'Loading...'}</div>
      <div>{error && 'Error'}</div>
    </>
  );
}

export default App;
