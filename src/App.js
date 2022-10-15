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


/**
 * Why we used hasMore??
 * 
 * Let say you seached "test" in input. and there are a total of 500 books with title test. In page 0 server returned you 100books. 
 * 
 * When you scroll to 100th book, another api request initiated to get 101 to 200th books.
 * 
 * Each time we get response, we're checking if res.data.docs.length is > 0 or not.
 * 
 * When user scrolled 5 times to last of page, 5 api request sent and all 500books with title 'test' will be consumed.
 * 
 * Hence we shouldn't update page number or send request to get next set of books.
 */