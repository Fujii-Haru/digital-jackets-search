function dataset() {
  return {
    //API叩く用のジャンル名と、選択肢表示用のジャンル名のオブジェクト
    genre: [
      { name: "J-Pop", jpn: "J-POP" },
      { name: "Rock", jpn: "ロック" },
      { name: "Electronic", jpn: "電子音楽(EDM)" },
      { name: "Hip-Hop/Rap", jpn: "ヒップホップ/ラップ" },
      { name: "Anime", jpn: "アニメ" },
      { name: "Reggae", jpn: "レゲエ" },
    ],
    colors: [
      { name: "red", jpn: "赤" },
      { name: "blue", jpn: "青" },
      { name: "yellow", jpn: "黄" },
      { name: "green", jpn: "緑" },
      { name: "pink&purple", jpn: "ピンク/紫" },
      { name: "white", jpn: "白" },
      { name: "black", jpn: "黒" },
    ],
    keyword: "", //v-model用
    color: "", //v-model用
    now_music: "", //試聴のとき、再生・停止管理用
    tracks: [], //とってきた曲の入れ物(オブジェクトのかたち！)
    after_tracks: [], //最終ユーザーに表示するデータ
    pop_info: {
      img: "",
      album: "",
      artist: "",
    },
    pop: false,
    show: false,

    //ジャケットが何色に属するか決める関数
    color_decide() {
      const images = document.querySelectorAll(".track_img"); //ジャケット写真のimg要素

      //forEachは配列を順番に処理するときに使う(mapやfilterと違って直接加工する)
      images.forEach((img, index) => {
        if (this.tracks[index]) {
          const canvas = document.createElement("canvas"); //ここで作ったcanvaエレメントは表に見えない

          const ctx = canvas.getContext("2d"); //ctx(コンテキスト)という道具を準備する。2次元のルールでcanvasを扱う
          ctx.drawImage(img, 0, 0, 1, 1); //imgを(0,0)座標から1px*1pxで描く というメソッド
          const data = ctx.getImageData(0, 0, 1, 1).data; //(0,0)座標から1px*1pxの範囲を判定。返ってくる情報のうちdataの部分にRGBの情報があるのでそこだけ抜き出す
          //getContextもdrawImageもgetImageDataも、javascriptに元々あるメソッド！

          this.tracks[index].rgb = {
            red: data[0],
            green: data[1],
            blue: data[2],
          }; //tracksオブジェクトにrgbの情報を追加
        } else {
          console.log(index + "番目のデータは見つかりません");
        }
        console.log("完了！");
      });
    },

    //API叩く関数
    async genre_search() {
      const res = await fetch(
        `https://itunes.apple.com/search?term=${this.keyword}&entity=album&attribute=genreIndex&limit=200&country=jp`
      );
      const music = await res.json();
      this.tracks = music.results;
      //console.log(JSON.stringify(music, null, 2));
      //console.log(this.tracks);

      setTimeout(this.color_decide, 1500); //function()の形にするとすぐ実行されてしまう
    },

    //指定された色のジャケットのみを表示する関数
    color_search() {
      this.after_tracks = this.tracks.filter((track) => {
        const { red, green, blue } = track.rgb; //分割代入

        if (this.color == "red") {
          return red > green + 100 && red > blue + 100;
        }
        if (this.color == "blue") {
          return blue > red + 40 && blue > green + 40;
        }
        if (this.color == "yellow") {
          return red > blue + 80 && green > blue + 80;
        }
        if (this.color == "green") {
          return green > red + 20 && green > blue + 20;
        }
        if (this.color == "pink&purple") {
          return (
            (red > green + 30 && blue > green + 30) ||
            (red > 200 && blue > 200 && green < 50)
          );
        }
        if (this.color == "white") {
          return red > 240 && green > 240 && blue > 240;
        }
        if (this.color == "black") {
          return red < 40 && green < 40 && blue < 40;
        }
      });

      this.show = true;
    },

    //アルバム名でもう一度APIを叩いてアルバムの一曲目を再生する関数
    async play_music(track) {
      if (this.now_music) {
        this.now_music.pause();
      } //もし再生中なら停止する

      const res = await fetch(
        `https://itunes.apple.com/lookup?id=${track.collectionId}&entity=song&country=jp&lang=ja_jp`
      ); //track.collectionIdはアルバムID、そのアルバムの中のsongを探している
      const data = await res.json();

      if (data.results.length > 1) {
        const previewUrl = data.results[1].previewUrl;
        this.now_music = new Audio(previewUrl);
        this.now_music.play();
        console.log("再生中: " + data.results[1].trackName);
      } //data.resulut[1]にアルバムの一曲目の情報が入っている
      else {
        console.log("プレビューが見つかりませんでした");
      }

      this.pop_info = {
        img: track.artworkUrl100,
        album: track.collectionName,
        artist: track.artistName,
      }; //ジャケット、アルバム名、アーティスト名
      this.pop = true;
    },

    stop_music() {
      if (this.now_music) {
        this.now_music.pause();
      }
      console.log("再生停止");
    },
  };
}
