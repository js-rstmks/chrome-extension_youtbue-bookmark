

(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  
    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
  
    const addNewBookmarkEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;

      console.log(currentTime)
      const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
      };
  
      currentVideoBookmarks = await fetchBookmarks();
  
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
    };
  
    const newVideoLoaded = async () => {
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
      currentVideoBookmarks = await fetchBookmarks();

      console.log(currentVideoBookmarks)
  
      if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");
  
        bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";
  
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];
  
        youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, videoId } = obj;

      console.log(obj)

      console.log(`videoId: ${videoId}`)
      console.log(value)
  
      if (type === "NEW") {
        console.log("あああ")
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        console.log("いいい")
        /**
         *  document.getElementsByClassName('video-stream')[0];で
         * <video tabindex="-1" class="video-stream html5-main-video" controlslist="nodownload" 
         * src="blob:https://www.youtube.com/53e8cbe9-d85a-41d4-a1b9-9f661c094f77" style="width: 818px; 
         * height: 460px; left: 0px; top: 0px;"></video>
         * が取得できて
         * このelementのcurrentTime propertyをいじることで動画の時間を変更できる
         */
        youtubePlayer.currentTime = value;
      } else if ( type === "DELETE") {
        console.log("ううう")
        currentVideoBookmarks = currentVideoBookmarks.filter((bookmark) => bookmark.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
  
        response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };
  