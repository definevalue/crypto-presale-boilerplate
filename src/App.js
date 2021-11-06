import { useState, useLayoutEffect, useEffect } from "react";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import Web3 from "web3";
import { loveAirDrop, PreSale } from "./contract/environment";
import loveAirDropABI from "./contract/loveAirDropABI.json";
import preSaleABI from "./contract/preSaleABI.json";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ClipLoader from "react-spinners/ClipLoader";
import { token } from './contract/environment'
import "./App.css";

//Konstantin Work
// Images URLs
// import navImg from './main-bg.png'
/****Start Header****/
//bootstrap
// import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCoffee } from '@fortawesome/free-solid-svg-icons'
//image
import logoImg from './asset/image/newlogo.png'


/****End Header****/

const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
var refLink;
let getRefAddress = localStorage.getItem("LovePort");
let getDirectFromUrl;
let url = window.location.href;
if (url.includes("?ref=")) {
  let getAddress = url.split("?ref=")[1];
  let final = getAddress.slice(0, 42);
  getDirectFromUrl = final;
}


function App() {
  const [state, setState] = useState({
    account: undefined,
    loveAirDropVal: null,
    preSaleVal: null,
    toWei: null,
    owner: null,
    fromWei: null,
    connectMetaMask: null,
    claimTime: "",
    allowance: "",
    copied: false,

  });
  const [swapFrom, setSwapFrom] = useState("");
  const [swapTo, setSwapTo] = useState("");
  const [loadingClaimDrop, setLoadingClaimDrop] = useState(false);
  const [BNBPrice, setBNBprice] = useState("");
  const [airdropfee, setairDropFee] = useState();
  refLink = getDirectFromUrl ? getDirectFromUrl : getRefAddress ? getRefAddress : state.owner
  // console.log("BNBPrice", BNBPrice);
  // console.log("state", state);
  // console.log("state", state);
  const connectToMetaMask = async (connect) => {
    try {
      const accounts = await connect();
      setState((prevState) => ({ ...prevState, account: accounts[0] }));
    } catch (error) {
      console.error("requestAccounts", error);
    }
  };

  useLayoutEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      const web3 = new Web3(window.ethereum);
      const loveAirDropVal = new web3.eth.Contract(loveAirDropABI, loveAirDrop);
      const preSaleVal = new web3.eth.Contract(preSaleABI, PreSale);

      setState((prevState) => ({
        ...prevState,
        loveAirDropVal,
        preSaleVal,
        toWei: web3.utils.toWei,
        fromWei: web3.utils.fromWei,
        connectMetaMask: () => connectToMetaMask(web3.eth.requestAccounts),
      }));

      //   connectToMetaMask(web3.eth.requestAccounts);
      preSaleVal.methods
        .owner()
        .call()
        .then((res) => {
          // console.log("res", res);
          setState((prevState) => ({ ...prevState, owner: res }));
        });
      // one bnb value
      preSaleVal.methods
        .bnbToToken("1000000000000000000")
        .call()
        .then((val) => setBNBprice(val))
        .catch((e) => console.log("e", e));

      loveAirDropVal.methods.airdropfee().call().then((res) => { console.log(setairDropFee(res)) })

    } else {
      alert("Please install MetaMask");
    }
  }, []);
  const connetToWalletBtn = () => {
    alert("connect");
  };
  // const digits_only = (string) =>
  //   [...string].every((c) => "0123456789".includes(c));
  // const validate = (email) => {
  //   var re = /^[0-9\b]+$/;
  //   return re.test(String(email).toLowerCase());
  // };
  const checkValue = (e) => {
    setSwapFrom(e);
    if (e != "") {
      // console.log("work");
      state.preSaleVal.methods
        .bnbToToken(state.toWei(e))
        .call()
        .then((val) => setSwapTo(val))
        .catch((e) => console.log("e", e));
    } else {
      let val = e.substring(0, e.length - 1);
      setSwapFrom(val);
    }
  };
  const buyLovePot = () => {
    // console.log("swapTo", swapFrom);
    // console.log("state.toWei(swapFrom)", state.toWei(swapFrom));
    // console.log("state.account", state.account);
    // console.log("state.owner", state.owner);
    if (swapFrom > 0) {
      state.preSaleVal.methods
        .buyTokenLove(refLink)
        .send({ value: state.toWei(swapFrom), from: state.account })
        .then((val) => toast.success("Successfully!"))
        .catch((e) => toast.error("Failed!"));
    }
  };
  const clainAirDrop = () => {
    // setLoadingClaimDrop(true);
    state.loveAirDropVal.methods
      .claimAirDrop(refLink)
      .send({
        from: state.account,
        value: airdropfee
      })
      .then((val) => {
        toast.success("Successfully Claim!")
        setLoadingClaimDrop(false)
      })
      .catch((e) => toast.error("Failed!"), setLoadingClaimDrop(false));
  };
  // const CopyLink = () => {
  //   toast.success("Copied!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: false,
  //     closeOnClick: true,
  //     pauseOnHover: true,
  //     draggable: true,
  //     progress: undefined,
  //   });
  // };
  const toggleMenu = () => {
    document.getElementById("menu").classList.toggle("hidden");
  };
  // const toggleList = () => {
  //   document.getElementById("curr-menu").classList.toggle("hidden");
  // };
  // const setToOption1 = () => {
  //   document.getElementById("currency-value").textContent = "BUSD";
  //   document.getElementById("curr-menu").classList.add("hidden");
  // };
  // const setToOption2 = () => {
  //   document.getElementById("currency-value").textContent = "BNB";
  //   document.getElementById("curr-menu").classList.add("hidden");
  // };
  const hideModal = () => {
    document.getElementById("newsletter").classList.add("hidden");
  };
  useEffect(() => {
    if (window.location.href.includes("?ref=")) {
      let getAddress = window.location.href.split("?ref=")[1];

      let final = getAddress.slice(0, 42);
      localStorage.setItem("LovePort", final);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        window.ethereum.on("accountsChanged", (accounts) => {
          let final = web3.utils.toChecksumAddress(accounts[0]);
          setState((prevState) => ({ ...prevState, account: final }));
        });
      } catch (err) { }
      try {
        if (typeof window.ethereum !== "undefined") {
          await web3.eth.getAccounts((err, accs) => {
            setState((prevState) => ({ ...prevState, account: accs[0] }));
          });
        }
      } catch (err) { }
    })()
  }, [])




  return (
 <div onClick={hideModal} className="relative">
      <ToastContainer />
      {/* Initial Metamask Modal */}
      <div
        id="newsletter"
        className="relative flex items-center justify-center w-full h-full modal"
      >
        <div className="absolute z-30 flex flex-col items-center justify-center w-9/12 px-4 py-8 bg-gray-900 shadow-lg modalbox-height modal-box sm:w-7/12 md:w-8/12 lg:w-5/12 top-24 xl:px-10">
          <h1 className="text-xl font-medium text-center text-white sm:text-2xl md:text-3xl">
            Connect to a wallet
          </h1>
          <div className="w-full mt-8 rounded-2xl md:mt-16">
            <button
              onClick={!state.account ? state.connectMetaMask : undefined}
              className="flex items-center justify-between w-full px-2 py-2 modal-button1 md:px-4 md:py-4"
            >
              <p className="text-xl text-red-500 sm:text-2xl md:text-3xl">
                Metamask
              </p>
              <div>
                {/* <img src="https://pre.shibnet.com/img/meta.svg" alt="" /> */}
              </div>
            </button>
          </div>
          <button
            onClick={!state.account ? state.connectMetaMask : undefined}
            className="flex items-center justify-between w-full px-2 py-2 mt-4 border-4 border-gray-600 md:px-4 md:py-4 md:mt-8"
          >
            <p className="text-xl text-gray-100 sm:text-2xl md:text-3xl">
              Trust Wallet
            </p>
            <div>
              {/* <img src="https://pre.shibnet.com/img/trust.svg" alt="" /> */}
            </div>
          </button>
          <button
            onClick={!state.account ? state.connectMetaMask : undefined}
            className="flex items-center justify-between w-full px-2 py-2 mt-4 border-4 border-gray-600 md:px-4 md:py-4 md:mt-8"
          >
            <p className="text-xl text-gray-100 sm:text-2xl md:text-3xl">
              SafePal
            </p>
            <div>
              {/* <img src="https://pre.shibnet.com/img/safepal.svg" alt="" /> */}
            </div>
          </button>
        </div>
      </div>

      {/* Main sector */}
      {/* Nav Bar */}
      <section className="navbar">
        <div className="container">
          <div className="row">
            <div className="col-md-3 col-9 col-sm-3 text-left text-white-50 font-weight-bolder font-20">
                <img src={logoImg} class="logo" />
            </div>
            <div className="col-md-6 col-12 justify-content-center align-items-center d-flex">
              <div className="row">
                <div className="col-3">
                  <a class="social-btn" href="http://twitter.com" target="_blank">
                    <i aria-hidden="true" className="fa fa-twitter" style={{ fontSize : "36px" }}></i>
                  </a>
                </div>
                <div className="col-3">
                  <a class="social-btn" href="http://www.reddit.com" target="_blank">
                    <i aria-hidden="true" className="fa fa-reddit" style={{ fontSize : "36px" }}></i>
                  </a>
                </div>
                <div className="col-3">
                  <a class="social-btn" href="http://www.youtube.com" target="_blank">
                    <i aria-hidden="true" className="fa fa-youtube" style={{ fontSize : "36px" }}></i>
                  </a>
                </div>
                <div className="col-3">
                  <a class="social-btn" href="http://t.me" target="_blank">
                    <i aria-hidden="true" className="fa fa-telegram" style={{ fontSize : "36px" }}></i>
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-12">
              <div className="container relative z-10 mx-auto xl:px-20">
                <div className="relative flex items-center justify-between p-4 bg-gray-50 bg-opacity-5">
                  <div
                    id="menu"
                    className="absolute z-20 hidden w-6/12 px-4 py-8 bg-gray-900 shadow-2xl lg:hidden top-12 right-10 md:w-5/12"
                  >
                    <ul className="flex flex-col space-y-8">
                      <li className="pb-2 border-b border-gray-600">
                        <a
                          href="https://manapool.finance/network/"
                          className="text-base text-white hover:underline"
                        >
                          Network
                        </a>
                      </li>
                      <li className="pb-2 border-b border-gray-600">
                        <a
                          href="https://manapool.finance/tokens/"
                          className="text-base text-white hover:underline"
                        >
                        Token
                        </a>
                      </li>
                      <li className="pb-2 border-b border-gray-600">
                      <a
                        href="https://manapool.finance/marketplace/"
                        className="text-base text-white hover:underline"
                      >
                        Marketplace
                      </a>
                    </li>
                    <li className="pb-2 border-b border-gray-600">
                      <a
                        href="javascript:void(0)"
                        className="text-base text-white hover:underline"
                      >
                        Whitepaper
                      </a>
                    </li>
                    <li className="pb-2 border-b border-gray-600">
                      <a
                        href="https://manapool.finance/members/"
                        className="text-base text-white hover:underline"
                      >
                        Members
                      </a>
                    </li>
                    <li className="pb-2 border-b border-gray-600">
                      <a
                        href="https://manapool.finance/blog/"
                        className="text-base text-white hover:underline"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                  <div className="flex flex-col mt-8 space-y-8">
                    <button className="px-3 py-1 text-white bg-transparent content-area-button2 rounded-full bnb-border">
                      BNB
                    </button>
                    <button className="px-3 py-1 text-white bg-transparent rounded-full content-area-button button-md-bg">
                      {state.account ? state.account?.slice(0, 5) + "..." + state.account?.slice(-5) : "Connect Wallet"}
                    </button>
                  </div>
                </div>
                <div className="w-1/4">
                  <img
                    src="https://pre.shibnet.com/pre-sale-logo.png"
                    alt=""
                  />
                </div>
                <div className="flex justify-center hidden w-1/2 lg:block">
                  <ul className="flex items-center space-x-8">
                    <li>
                      <a
                        href="https://manapool.finance/network/"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Network
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://manapool.finance/tokens/"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Token
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://manapool.finance/marketplace/"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Marketpalce
                      </a>
                    </li>
                    <li>
                      <a
                        href="javascript:void(0)"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Whitepaper
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://manapool.finance/members/"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Members
                      </a>
                    </li>
                    <li>
                      <a
                        href="https://manapool.finance/blog/"
                        className="text-base text-white hover:underline"
                        target="_blank"
                      >
                        Blog
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="flex items-center justify-end hidden w-1/4 space-x-6 lg:block">
                  <a
                    href="javascript:void(0)"
                    className="text-white hover:underline"
                  >
                    BNB
                  </a>
                  {state.account ? (
                    <button
                      className="px-6 py-2 text-white rounded-full hover:underline"
                      style={{ backgroundColor: "#e21b63" }}
                    // onClick={() => connectToMetaMask()}
                    // onClick={()=>state.connectMetaMask}
                    >
                      {state.account.slice(0, 6) + "..." + state.account.slice(-4)}
                    </button>
                  ) : (
                    <button
                      className="px-6 py-2 text-white rounded-full content-area-button2"
                      style={{ backgroundColor: "#e21b63" }}
                      onClick={!state.account ? state.connectMetaMask : undefined}
                    >
                      Connect Wallet
                    </button>
                  )}
                </div>
                <div className="lg:hidden">
                  <button
                    onClick={toggleMenu}
                    className="rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="icon icon-tabler icon-tabler-menu-2"
                      width="44"
                      height="44"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="#ffffff"
                      fill="none"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <line x1="4" y1="6" x2="20" y2="6" />
                      <line x1="4" y1="12" x2="20" y2="12" />
                      <line x1="4" y1="18" x2="20" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center px-4 md:px-6 lg:px-10 ">
                <div className="flex flex-col justify-center  items-center mt-1 sm:mt-4 md:mt-12 lg:mt-20 ">
                  <h1 className="text-xl font-medium leading-normal text-white sm:text-2xl md:text-3xl lg:text-4xl">
                  #1 Real Social Network
                  </h1>
                  <h1 className="text-xl items-center font-medium leading-normal text-white sm:text-2xl md:text-3xl lg:text-4xl">
                  Cryptocurrency
                  </h1>
                  <button className="w-11/12 px-8 py-2 mt-8 text-white  items-center rounded-full bg-button-image content-area-button sm:w-8/12 md:w-8/12 lg:w-6/12">
                  <a
                    href="https://t.me/shibnet"
                    target="_blank"
                    className="text-white"
                  >
                    Join Telegram
                  </a>
                  </button>
                </div>
              </div>
            </div>


            </div>
          </div>
            

          {/* <div className="container relative z-10 mx-auto xl:px-20">
            <div className="relative flex items-center justify-between p-4 bg-gray-50 bg-opacity-5">
              <div
                id="menu"
                className="absolute z-20 hidden w-6/12 px-4 py-8 bg-gray-900 shadow-2xl lg:hidden top-12 right-10 md:w-5/12"
              >
                <ul className="flex flex-col space-y-8">
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="https://manapool.finance/network/"
                      className="text-base text-white hover:underline"
                    >
                      Network
                    </a>
                  </li>
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="https://manapool.finance/tokens/"
                      className="text-base text-white hover:underline"
                    >
                      Token
                    </a>
                  </li>
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="https://manapool.finance/marketplace/"
                      className="text-base text-white hover:underline"
                    >
                      Marketplace
                    </a>
                  </li>
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="javascript:void(0)"
                      className="text-base text-white hover:underline"
                    >
                      Whitepaper
                    </a>
                  </li>
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="https://manapool.finance/members/"
                      className="text-base text-white hover:underline"
                    >
                      Members
                    </a>
                  </li>
                  <li className="pb-2 border-b border-gray-600">
                    <a
                      href="https://manapool.finance/blog/"
                      className="text-base text-white hover:underline"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
                <div className="flex flex-col mt-8 space-y-8">
                  <button className="px-3 py-1 text-white bg-transparent content-area-button2 rounded-full bnb-border">
                    BNB
                  </button>
                  <button className="px-3 py-1 text-white bg-transparent rounded-full content-area-button button-md-bg">
                    {state.account ? state.account?.slice(0, 5) + "..." + state.account?.slice(-5) : "Connect Wallet"}
                  </button>
                </div>
              </div>
              <div className="w-1/4">
                <img
                  src="https://pre.shibnet.com/pre-sale-logo.png"
                  alt=""
                />
              </div>
              <div className="flex justify-center hidden w-1/2 lg:block">
                <ul className="flex items-center space-x-8">
                  <li>
                    <a
                      href="https://manapool.finance/network/"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Network
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://manapool.finance/tokens/"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Token
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://manapool.finance/marketplace/"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Marketpalce
                    </a>
                  </li>
                  <li>
                    <a
                      href="javascript:void(0)"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Whitepaper
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://manapool.finance/members/"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Members
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://manapool.finance/blog/"
                      className="text-base text-white hover:underline"
                      target="_blank"
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-end hidden w-1/4 space-x-6 lg:block">
                <a
                  href="javascript:void(0)"
                  className="text-white hover:underline"
                >
                  BNB
                </a>
                {state.account ? (
                  <button
                    className="px-6 py-2 text-white rounded-full hover:underline"
                    style={{ backgroundColor: "#e21b63" }}
                  // onClick={() => connectToMetaMask()}
                  // onClick={()=>state.connectMetaMask}
                  >
                    {state.account.slice(0, 6) + "..." + state.account.slice(-4)}
                  </button>
                ) : (
                  <button
                    className="px-6 py-2 text-white rounded-full content-area-button2"
                    style={{ backgroundColor: "#e21b63" }}
                    onClick={!state.account ? state.connectMetaMask : undefined}
                  >
                    Connect Wallet
                  </button>
                )}
              </div>
              <div className="lg:hidden">
                <button
                  onClick={toggleMenu}
                  className="rounded focus:outline-none focus:ring-2 focus:ring-gray-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="icon icon-tabler icon-tabler-menu-2"
                    width="44"
                    height="44"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="#ffffff"
                    fill="none"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="20" y2="12" />
                    <line x1="4" y1="18" x2="20" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex flex-col items-center px-4 md:px-6 lg:px-10 ">
              <div className="flex flex-col justify-center  items-center mt-1 sm:mt-4 md:mt-12 lg:mt-20 ">
                <h1 className="text-xl font-medium leading-normal text-white sm:text-2xl md:text-3xl lg:text-4xl">
                #1 Real Social Network
                </h1>
                <h1 className="text-xl items-center font-medium leading-normal text-white sm:text-2xl md:text-3xl lg:text-4xl">
                Cryptocurrency
                </h1>
                <button className="w-11/12 px-8 py-2 mt-8 text-white  items-center rounded-full bg-button-image content-area-button sm:w-8/12 md:w-8/12 lg:w-6/12">
                <a
                  href="https://t.me/shibnet"
                  target="_blank"
                  className="text-white"
                >
                  Join Telegram
                </a>
                </button>
              </div>
            </div>
          </div> */}
        </div>
      </section>
      
      <div style={{ backgroundColor: "#e7faff" }}>
        <div className="container flex flex-col items-center justify-center mx-auto text-center py-14 sm:py-12">
          <h1 className="text-2xl text-red-500 md:text-4xl lg:text-5xl gray-600">
            Buy Mana (Mana)
          </h1>
          <p className="mt-4 text-xs text-red-500 sm:text-base lg:text-lg">
            MIN: ~0.05 BNB / MAX: ~10 BNB (+GAS BNB / BEP20)
          </p>
          <div className="px-2">
            <div
              style={{ backgroundColor: "#1e134b" }}
              className="flex flex-col items-center px-4 py-2 mt-8 rounded-full sm:flex-row shadow-css1 md:py-2 sm:space-x-2"
            >
              <div className="flex items-center space-x-2">
                <p
                  className="text-base italic font-black lg:text-lg"
                  style={{ color: "rgb(116, 63, 229)" }}
                >
                  Attention:{" "}
                </p>
              </div>
              <p className="text-sm italic font-black text-red-500 md:text-base">
                ICO Price 140.000.000 BUSD, Pancakeswap Listing Price 70.000.000 BUSD
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center w-11/12 p-4 mt-6 md:mt-12 lg:w-5/12 border-rounded-table rounded-3xl content-area md:p-6 shadow-css">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-xl font-bold text-red-500 md:text-2xl">Swap</h2>
              <div>
                <img src="https://pre.shibnet.com/img/setting.svg" alt="" />
              </div>
            </div>
            <div
              style={{ backgroundColor: "#fff" }}
              className="flex justify-between w-full px-2 pt-4 pb-2 mt-4 md:mt-6 md:pt-6 md:px-4 md:pb-4 rounded-2xl md:rounded-3xl shadow-css1 "
            >
              <div className="flex flex-col justify-start space-y-4 md:space-y-8">
                <p
                  style={{ color: "#392c6e" }}
                  className="text-lg text-left text-gray-600"
                >
                  <strong>From</strong>
                </p>
                <input
                  id="valid-amount"
                  type="text"
                  type="number"
                  placeholder="0"
                  className="w-40 text-3xl text-red-500 bg-transparent focus:outline-none"
                  value={swapFrom}
                  //  type="number"
                  onChange={(e) => checkValue(e.target.value)}
                />
              </div>
              <div className="relative flex flex-col justify-end">
                <button
                  //   onClick={toggleList}
                  className="flex items-center px-1 py-2 space-x-4 rounded-lg content-area-button2 md:py-3 md:px-2"
                >
                  <div>
                    <img src="https://pre.shibnet.com/img/bnb.svg" alt="" />
                  </div>
                  <p
                    id="currency-value"
                    className="text-base text-white md:text-xl"
                  >
                    BNB
                  </p>
                  <div>
                    <img
                      src="https://pre.shibnet.com/img/down.svg"
                      alt=""
                    />
                  </div>
                </button>

                {/* <div
                  id="curr-menu"
                  className="absolute z-10 flex flex-col hidden w-11/12 pt-1 pb-1 bg-gray-900 rounded -bottom-28"
                >
                  <button
                    onClick={setToOption1}
                    className="px-2 pb-3 text-base text-left text-red-500 border-b border-gray-300 md:text-xl hover:bg-gray-800"
                  >
                    BUSD
                  </button>
                  
                  <button
                    onClick={setToOption2}
                    className="px-2 pb-3 text-base text-left text-red-500 border-b border-gray-300 md:text-xl hover:bg-gray-800"
                  >
                    BNB
                  </button>
                </div> */}
              </div>
            </div>

            <div className="mt-4 md:mt-8">
              <img src="https://pre.shibnet.com/img/Arrow2.svg" alt="" />
            </div>
            <div
              style={{ backgroundColor: "#fff" }}
              className="flex justify-between w-full px-4 pt-6 pb-4 mt-4 bg-gray-900 shadow-2xl md:mt-8 rounded-3xl shadow-css1"
            >
              <div className="flex flex-col justify-start space-y-4 md:space-y-8">
                <p
                  style={{ color: "#392c6e" }}
                  className="text-lg text-left text-gray-600"
                >
                  <strong>To</strong>
                </p>
                <input
                  type="text"
                  value={swapTo}
                  style={{ width: 175 }}
                  className="w-10 text-3xl text-red-500 bg-transparent focus:outline-none"
                />
              </div>
              <div className="relative flex flex-col justify-end">
                <button className="flex items-center w-full px-2 py-2 space-x-8 rounded-lg content-area-button2 md:py-3 md:px-8">
                  <p id="currency-value" className="text-xl text-white">
                  Mana
                  </p>
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between w-full px-4 mt-4">
              <p className="text-red-500">Price</p>
              <p className="font-medium text-red-500">140.000.000 Mana per BUSD</p>
            </div>
            {state.account ? (
              <button
                onClick={buyLovePot}
                className="w-full py-2 mt-6 text-xl text-white uppercase rounded-full shadow-inner md:mt-10 lg:mt-6 content-area-button lg:py-4 sm:text-2xl lg:text-3xl"
              >
                Buy Now
              </button>
            ) : (
              <button onClick={!state.account ? state.connectMetaMask : undefined} className="w-full py-2 mt-6 text-xl text-white uppercase rounded-full shadow-inner md:mt-10 lg:mt-6 content-area-button lg:py-4 sm:text-2xl lg:text-3xl">
                Connect to Wallet
              </button>
            )}
          </div>
          <div className="flex justify-center mt-7 md:mt-14">
            <p className="w-11/12 text-lg text-center text-red-500 md:w-7/12">
              For every purchase that your referral makes, you will receive an
              additional 3% token to your wallet.
            </p>
          </div>
          <div className="mt-7 md:mt-14">
            <p className="text-xs font-bold text-red-500 sm:text-xs lg:text-lg">
              TOKEN ADDRESS: {token}
            </p>
          </div>
          <div
            style={{ backgroundColor: "#1e134b" }}
            className="flex flex-col justify-center p-2 mx-4 mt-8 bg-gray-900 md:mt-10 lg:mt-20 shadow-css1 sm:flex-row rounded-xl lg:w-5/12"
          >
            <p
              className="text-sm italic"
              style={{ color: "rgb(116, 63, 229)" }}
            >
              Attention:
            </p>
            <p className="text-sm italic text-red-500">
              Remember that Mana is a deflationary token in Presale All Tax
              Fee, Liqudity Fee, Dev Fee is set to Zero.
            </p>
          </div>

          <div className="mx-4 md:mt-6 lg:mt-10">
            <h2 className="text-center hpRDUw">CLAIM AIRDROP</h2>
            <p className="mt-4 text-sm text-center text-red-500 sm:text-lg">
              Claim your token now and start buying at the lowest market price.
            </p>
            <p className="mt-4 text-3xl text-red-500 sm:text-4xl">280.000.000 Mana</p>
            {loadingClaimDrop ? (
              <ClipLoader color="green" loading={loadingClaimDrop} size={60} />
            ) : (
              <button
                onClick={clainAirDrop}
                style={{ backgroundColor: "#e21b63" }}
                className="px-3 py-3 mt-4 text-base text-white uppercase rounded-lg shadow-2xl content-area content-area-button text-light md:text-lg md:py-4 md:px-6 md:mt-8 focus:outline-none"
              >
                Claim Airdrop here
              </button>
            )}
            <p className="mt-4 text-base text-red-500 uppercase md:mt-8">
              CLAIM AIRDROP NOW 280.000.000 Mana FOR FREE (+GAS BNB / BEP20)
            </p>
          </div>

          <div className="flex flex-col items-center px-4 py-6 mt-8 border-t-2 border-b-2 border-white md:mt-14 lg:mt-24 md:px-10 md:py-10 lg:py-20 lg:w-8/12">
            <h2 className="text-xl text-center text-red-500 sm:text-2xl md:text-3xl lg:text-4xl">
              Invite by
            </h2>
            <input
              style={{ backgroundColor: "#e7faff" }}
              type="text"
              className="w-11/12 px-4 py-2 mt-3 text-base text-center text-gray-600 bg-gray-900 focus:outline-none lg:w-10/12 lg:mt-6 gradient-border shadow-css1 lg:py-4 sm:px-8 md:text-xl lg:text-2xl"
              value={
                window.location.search
                  ? window.location.search.split("?ref=")[1]
                  : state.owner
              }
            />
            <p className="mt-4 text-xl text-center text-red-500 sm:text-2xl md:text-3xl lg:text-4xl lg:w-11/12 md:mt-8">
              For referring another partner, you automatically receive 3% Mana
            </p>
          </div>

          <div className="flex flex-col items-center w-full px-4 mt-8 sm:mt-14 lg:mt-24 lg:w-8/12 md:px-10">
            <h2 className="text-xl text-center text-red-500 sm:text-2xl md:text-3xl lg:text-4xl">
              My referral link
            </h2>
            <input
              style={{ backgroundColor: "#e7faff" }}
              type="text"
              className="w-11/12 px-8 py-2 mt-3 text-base text-center text-gray-600 bg-gray-900 lg:w-10/12 lg:mt-6 gradient-border shadow-css1 lg:py-4 md:text-xl lg:text-2xl"
              value={state.account ? state.account : "Connect Your Wallet"}
            />
            <CopyToClipboard
              text={window.location.origin + "/?ref=" + state.account}
              onCopy={() => toast.success("Copied!")}
            >
              <button
                //   onClick={CopyLink}
                className="px-8 py-2 mt-6 text-red-500 uppercase rounded-lg shadow-2xl lg:mt-12 content-area-button2 md:py-3 focus:outline-none content-area "
              >
                Copy My referral Link
              </button>
            </CopyToClipboard>
          </div><br/><br/>
          <h3><strong>Disclaimer:</strong></h3>
          <p className="text-sm italic text-red-500">
          The information provided on Mana website does not constitute investment advice, financial advice, trading advice, or any other sort of advice and you should not treat any of the website’s content as such. The Mana team does not recommend that any cryptocurrency should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions.
            </p><br/>
            <p className="text-sm italic text-red-500">
            By purchasing Mana, you agree that you are not purchasing a security or investment and you agree to hold the team harmless and not liable for any losses or taxes you may incur. You also agree that the team is presenting the token “as is” and is not required to provide any support or services. Always make sure that you are in compliance with your local laws and regulations before you make any purchase.
Please note there are always risks associated with smart-contracts. Please use at your own risk. Mana Token is not a registered broker, analyst or investment advisor. Everything that we provide on this site is purely for guidance, informational and educational purposes.         
           </p><br/>
            <p className="text-sm italic text-red-500">
            All information contained herein should be independently verified and confirmed. We do not accept any liability for any loss or damage whatsoever caused in reliance upon such information or services. Please be aware of the risks involved with any trading done in any financial market. Do not trade with money that you cannot afford to lose. When in doubt, you should consult a qualified financial advisor before making any investment decisions.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center w-full py-8 space-x-10 content-area">
        <a href="https://manapool.finance/" target="_blank" className="text-red-500 hover:underline">
        © 2021 - Mana
        </a>
      </div>
    </div>
  );
}

export default App;
