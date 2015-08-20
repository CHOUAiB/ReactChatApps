var Actions=Reflux.createActions(["didConnect","addMessages","removeAllMessages","recordMessage","refreshUsers","showError","logError","announce","userSelected","channelSelected","setText","aboutDialog"]),ChannelStore=Reflux.createStore({init:function(){this.listenTo(Actions.channelSelected,this.changeChannel),this.selected=AppData.selectedChannel,this.channels=AppData.channels},getData:function(){return{selected:this.selected,items:this.channels}},changeChannel:function(e){e&&(this.channels.indexOf(e)<0&&this.channels.push(e),this.selected=e,this.trigger(this.getData()))}}),MessagesStore=Reflux.createStore({init:function(){this.listenToMany(Actions),this.listenTo(ChannelStore,this.onChannelChanged),this.anonMsgId=-1,this.channels=ChannelStore.getData(),this.messages={}},notifyAll:function(){this.trigger(this.messages[this.channels.selected]||[])},didConnect:function(){this.addMessages([{message:"CONNECTED!",cls:"open"}])},logError:function(){this.addMessages([{message:"ERROR!",cls:"error"}])},addMessages:function(e){var t=this;e.forEach(function(e){$.map(t.channels.items,function(s){if(!e.channel||e.channel===s){var n=t.messages[s]||(t.messages[s]=[]);n.push({id:e.id||t.anonMsgId--,channel:e.channel,userId:e.fromUserId,userName:e.fromName,msg:e.message,cls:e.cls||(e.private?" private":""),time:new Date})}})}),this.notifyAll()},removeAllMessages:function(){this.messages={},this.notifyAll()},onChannelChanged:function(e){this.channels=e,this.notifyAll()}}),UsersStore=Reflux.createStore({init:function(){this.listenTo(Actions.refreshUsers,this.refreshUsers),this.listenTo(ChannelStore,this.onChannelChanged),this.channels=ChannelStore.getData(),this.users={}},notifyAll:function(){this.trigger(this.users[this.channels.selected]||[])},refreshUsers:function(){var e=this;$.getJSON(AppData.channelSubscribersUrl,function(t){e.users={};var s={};$.map(t,function(e){s[e.userId]=e}),$.map(s,function(t){t.channels.split(",").map(function(s){var n=e.users[s]||(e.users[s]=[]);n.push(t)})}),e.notifyAll()})},onChannelChanged:function(e){this.channels=e,this.notifyAll()}});$(document).bindHandlers({announce:Actions.announce,toggle:function(){$(this).toggle()},sendCommand:function(){"DIV"==this.tagName&&Actions.setText($(this).html())},removeReceiver:function(e){delete $.ss.eventReceivers[e]},addReceiver:function(e){$.ss.eventReceivers[e]=window[e]}}).on("customEvent",function(e,t,s){Actions.addMessages([{message:"[event "+e.type+" message: "+t+"]",cls:"event",channel:s.channel}])});var User=React.createClass({displayName:"User",handleClick:function(){Actions.userSelected(this.props.user)},render:function(){return React.createElement("div",{className:"user"},React.createElement("img",{src:this.props.user.profileUrl||"/img/no-profile64.png"}),React.createElement("span",{onClick:this.handleClick},this.props.user.displayName))}}),Header=React.createClass({displayName:"Header",getDefaultProps:function(){return{isAuthenticated:!1}},openChannel:function(){var e=prompt("Join another Channel?","ChannelName");e&&(location.href="?channels="+this.props.channels.items.join(",")+","+e.replace(/\s+/g,""))},selectChannel:function(e){Actions.channelSelected(e.target.getAttribute("data-channel"))},showDialog:function(){window.aboutDialog.show()},exitApplication:function(){window.winForm.close()},render:function(){var e=this;return React.createElement("div",{id:"top"},React.createElement("a",{href:"https://github.com/ServiceStackApps/LiveDemos"},React.createElement("img",{src:"https://raw.githubusercontent.com/ServiceStack/Assets/master/img/artwork/logo-32-inverted.png",style:{height:"28px",padding:"10px 0 0 0"}})),React.createElement("div",{id:"social"},React.createElement("div",{id:"welcome"},this.props.activeSub?React.createElement("span",null,React.createElement("span",null,"Welcome, ",this.props.activeSub.displayName),React.createElement("img",{src:this.props.activeSub.profileUrl})):null),this.props.isAuthenticated?null:React.createElement("span",null,React.createElement("a",{href:"/auth/twitter",className:"twitter"})),React.createElement("span",{style:{"float":"right",width:"25px"}},React.createElement("a",{onClick:e.exitApplication},React.createElement("img",{src:"/img/close.png",style:{height:"30px",marginTop:"-5px"}})))),React.createElement("ul",{id:"channels",style:{margin:"0 0 0 30px"}},this.props.channels.items.map(function(t){return React.createElement("li",{className:e.props.channels.selected==t?"selected":"",key:t,"data-channel":t,onClick:e.selectChannel},t)}),React.createElement("li",{style:{background:"none",padding:"0 0 0 5px"}},React.createElement("button",{onClick:this.openChannel},"+")),React.createElement("li",{style:{background:"none",padding:0}},React.createElement("span",{style:{fontSize:13,color:"#ccc",paddingLeft:10},onClick:Actions.removeAllMessages},"clear")),React.createElement("li",{style:{background:"none",padding:0}},React.createElement("span",{style:{fontSize:13,color:"#ccc",paddingLeft:10},onClick:e.showDialog},"about"))))}}),Sidebar=React.createClass({displayName:"Sidebar",getInitialState:function(){return{hideExamples:!1}},toggleExamples:function(){this.setState({hideExamples:!this.state.hideExamples})},render:function(){var e=this.state.hideExamples?"25px":"auto",t=this.state.hideExamples?"show":"hide";return React.createElement("div",{id:"right"},React.createElement("div",{id:"users"},this.props.users.map(function(e){return React.createElement(User,{key:e.userId,user:e})})),React.createElement("div",{id:"examples",style:{height:e}},React.createElement("span",{style:{position:"absolute",top:"2px",right:"7px"},onClick:this.toggleExamples},t),React.createElement("span",{"data-click":"sendCommand"},React.createElement("h4",null,React.createElement("a",{href:"https://github.com/ServiceStackApps/Chat#global-event-handlers"},"Example Commands")),React.createElement("div",null,"/cmd.announce This is your captain speaking ..."),React.createElement("div",null,"/cmd.toggle$#channels"),React.createElement("h4",null,React.createElement("a",{href:"https://github.com/ServiceStackApps/Chat#modifying-css-via-jquery"},"CSS")),React.createElement("div",null,"/css.background-image url(http://bit.ly/1oQqhtm)"),React.createElement("div",null,"/css.background-image url(http://bit.ly/1yIJOBH)"),React.createElement("div",null,"@me /css.background #eceff1"),React.createElement("div",null,"/css.background$#top #673ab7"),React.createElement("div",null,"/css.background$#bottom #0091ea"),React.createElement("div",null,"/css.background$#right #fffde7"),React.createElement("div",null,"/css.color$#welcome #ff0"),React.createElement("div",null,"/css.visibility$img,a hidden"),React.createElement("div",null,"/css.visibility$img,a visible"),React.createElement("h4",null,React.createElement("a",{href:"https://github.com/ServiceStackApps/Chat#receivers"},"Receivers")),React.createElement("div",null,"/tv.watch http://youtu.be/518XP8prwZo"),React.createElement("div",null,"/tv.watch https://servicestack.net/img/logo-220.png"),React.createElement("div",null,"@me /tv.off"),React.createElement("div",null,"/document.title New Window Title"),React.createElement("div",null,"/cmd.addReceiver window"),React.createElement("div",null,"/window.location http://google.com"),React.createElement("div",null,"/cmd.removeReceiver window"),React.createElement("h4",null,React.createElement("a",{href:"https://github.com/ServiceStackApps/Chat#jquery-events"},"Triggers")),React.createElement("div",null,"/trigger.customEvent arg"))))}}),ChatLog=React.createClass({displayName:"ChatLog",renderItem:function(e,t,s){var n=this.props.users.filter(function(t){return t.userId==e.userId})[0],a=e.msg.indexOf(this.props.activeSub.displayName.replace(" ",""))>=0?"highlight ":"",i="m_"+(e.id||"0"),c="msg "+a+e.cls,r=t>0&&s[t-1],l=r.userId==e.userId;return React.createElement("div",{key:i,id:i,className:c},e.userId&&!l?React.createElement("b",{className:"user"},React.createElement(User,{user:n||$.extend(e,{displayName:e.userName})})):React.createElement("b",null," "),React.createElement("i",null,$.ss.tfmt12(e.time||new Date)),React.createElement("div",null,e.msg))},render:function(){return React.createElement("div",{ref:"log",id:"log"},this.props.messages.map(this.renderItem))}}),Footer=React.createClass({displayName:"Footer",mixins:[Reflux.listenTo(Actions.userSelected,"userSelected"),Reflux.listenTo(Actions.setText,"setText")],getInitialState:function(){return{value:"",historyIndex:-1,msgHistory:[]}},componentDidMount:function(){this.refs.txtMsg.getDOMNode().focus()},postMsg:function(){var e,t=this.refs.txtMsg.getDOMNode(),s=t.value,n=null,a=this.props.activeSub;if(s&&this.state.msgHistory.push(s),"@"==s[0]){e=$.ss.splitOnFirst(s," ");var i=e[0].substring(1);if("me"==i)n=a.userId;else{var c=this.props.users.filter(function(e){return e.displayName===i.toLowerCase()})[0];n=c?c.userId:null}s=e[1]}if(s&&a){var r=function(e){e.responseJSON&&e.responseJSON.responseStatus&&Actions.showError(e.responseJSON.responseStatus.message)};"/"==s[0]?(e=$.ss.splitOnFirst(s," "),$.post("/channels/"+this.props.channel+"/raw",{from:a.id,toUserId:n,message:e[1],selector:e[0].substring(1)},function(){}).fail(r)):$.post("/channels/"+this.props.channel+"/chat",{from:a.id,toUserId:n,message:s,selector:"cmd.chat"},function(){}).fail(r),this.setState({value:""})}},userSelected:function(e){this.setText("@"+e.displayName+" ")},setText:function(e){var t=this.refs.txtMsg.getDOMNode();this.setState({value:e},function(){t.focus()})},handleChange:function(e){this.setState({value:e.target.value})},handleKeyDown:function(e){var t=this,s=e.keyCode,n=this.state.value;if($.ss.getSelection()&&("9"==s||"13"==s||"32"==s||"39"==s))return n+=" ",this.setState({value:n},function(){var e=t.refs.txtMsg.getDOMNode();e.setSelectionRange&&e.setSelectionRange(n.length,n.length)}),void e.preventDefault();var a=this.state.msgHistory;"13"==s?(this.state.historyIndex=-1,this.postMsg()):"38"==s?(this.state.historyIndex=Math.min(++this.state.historyIndex,a.length),this.setState({value:this.state.msgHistory[a.length-1-this.state.historyIndex]}),e.preventDefault()):"40"==s?(this.state.historyIndex=Math.max(--this.state.historyIndex,-1),this.setState({value:a[a.length-1-this.state.historyIndex]})):this.state.historyIndex=-1},handleKeyUp:function(){var e=this,t=this.state.value,s=this.props.activeSub;if(!$.ss.getSelection()&&"@"==t[0]&&t.indexOf(" ")<0){var n=t.substring(1),a=this.props.users.map(function(e){return e.displayName.replace(" ","")}).filter(function(e){return e.substring(0,n.length).toLowerCase()===n.toLowerCase()&&e.toLowerCase()!=s.displayName.toLowerCase()});a.length>0&&(t+=a[0].substring(n.length),this.setState({value:t},function(){var s=e.refs.txtMsg.getDOMNode();s.setSelectionRange&&s.setSelectionRange(n.length+1,t.length)}))}},render:function(){return React.createElement("div",{id:"bottom"},React.createElement("input",{ref:"txtMsg",id:"txtMsg",type:"text",value:this.state.value,onChange:this.handleChange,onKeyDown:this.handleKeyDown,onKeyUp:this.handleKeyUp}),React.createElement("button",{id:"btnSend",style:{marginLeft:5},onClick:this.postMsg},"Send"))}}),ChatApp=React.createClass({displayName:"ChatApp",mixins:[Reflux.listenTo(ChannelStore,"onChannelChanged"),Reflux.listenTo(MessagesStore,"onMessagesUpdate"),Reflux.listenTo(UsersStore,"onUsersUpdate"),Reflux.listenTo(Actions.announce,"announce"),Reflux.listenTo(Actions.showError,"showError")],templates:{youtube:function(e){var t="//www.youtube.com/embed/"+e+"?autoplay=1";return React.createElement("iframe",{width:"640",height:"360",src:t,frameBorder:"0",allowFullScreen:!0})},generic:function(e){return React.createElement("iframe",{width:"640",height:"360",src:e,frameBorder:"0"})}},getInitialState:function(){return{isAuthenticated:this.props.isAuthenticated,tvUrl:null,channels:null,messages:[],users:[],announce:"",activeSub:null}},componentDidMount:function(){var e=this;Actions.channelSelected(this.props.channel),this.source=new EventSource(this.props.eventStreamUrl),this.source.onerror=function(e){Actions.logError(e)},$.ss.eventReceivers={document:document},$(this.source).handleServerEvents({handlers:{onConnect:function(t){e.setState({activeSub:t}),Actions.didConnect(),$.getJSON(e.props.chatHistoryUrl,function(e){Actions.addMessages(e.results)}),Actions.refreshUsers()},onReconnect:function(){console.log("onReconnect",{newEventSource:this,errorArgs:arguments})},onJoin:Actions.refreshUsers,onLeave:Actions.refreshUsers,chat:function(e,t){e.channel=t.channel,Actions.addMessages([e])}},receivers:{tv:{watch:this.tvOn,off:this.tvOff}}})},onMessagesUpdate:function(e){var t=this;this.setState({messages:e},function(){t.refs.chatLog&&$(t.refs.chatLog.refs.log.getDOMNode()).scrollTop(1e10)})},onUsersUpdate:function(e){this.setState({users:e})},showError:function(e){this.announce(e)},announce:function(e){var t=this,s=$(this.refs.announce.getDOMNode());this.setState({announce:e},function(){s.fadeIn("fast")}),setTimeout(function(){s.fadeOut("slow"),t.setState({announce:""})},2e3)},tvOn:function(e){if(e.indexOf("youtube.com")>=0){var t=$.ss.queryString(e);this.setState({tvUrl:this.templates.youtube(t.v)})}else if(e.indexOf("youtu.be")>=0){var s=$.ss.splitOnLast(e,"/")[1];this.setState({tvUrl:this.templates.youtube(s)})}else this.setState({tvUrl:this.templates.generic(e)})},tvOff:function(){this.setState({tvUrl:null})},onChannelChanged:function(e){var t=this;this.setState({channels:e},function(){t.refs.footer.refs.txtMsg.getDOMNode().focus()})},render:function(){if(null==this.state.channels)return null;var e=this.state.tvUrl?"block":"none";return React.createElement("div",null,React.createElement(Header,{channels:this.state.channels,isAuthenticated:this.props.isAuthenticated,activeSub:this.state.activeSub}),React.createElement("div",{ref:"announce",id:"announce"},this.state.announce),React.createElement("div",{ref:"tv",id:"tv",style:{display:e}},this.state.tvUrl),React.createElement(Sidebar,{users:this.state.users}),React.createElement(ChatLog,{ref:"chatLog",messages:this.state.messages,users:this.state.users,activeSub:this.state.activeSub}),React.createElement(Footer,{ref:"footer",channel:this.state.channels.selected,users:this.state.users,activeSub:this.state.activeSub}))}});React.render(React.createElement(ChatApp,{channel:AppData.selectedChannel,isAuthenticated:AppData.isAuthenticated,eventStreamUrl:AppData.eventStreamUrl,chatHistoryUrl:AppData.chatHistoryUrl}),document.getElementById("app"));