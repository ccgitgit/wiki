import React from 'react';
import {markdown} from 'markdown';
import * as API from '../api';

export default class Section extends React.Component{
	constructor (props,context){
		super(props,context);
		this.context=context;
		this.state=this.getState(props);
	}

	componentWillReceiveProps(nextProps){
		var state=this.getState(nextProps);
		this.setState(state);
	}

	componentDidMount(prevProps,prevState){
		if(this.state.editing) React.findDOMNode(this.refs.editor).focus();
	}

	getState=props=>({
		locked:props.user && props.section.editor && props.user.username!==props.section.editor,
		editing:props.user && props.user.username===props.section.editor,
		content:props.section.content,
		html:props.section.content?markdown.toHTML(props.section.content):''
	})

	render(){
		//console.log(this.state);
		let content;
		if(this.state.editing){
			content=<textarea ref='editor' className='twelve columns' defaultValue={this.state.content} 
				onChange={this.updateContent} onBlur={this.save} />;
		}else{
			content=<span dangerouslySetInnerHTML={{__html:this.state.html}} />;
		}

		let classes=['row','section'];
		if(this.state.editing) classes.push('editing');
		if(this.props.user) classes.push(this.state.locked ? 'locked':'editable');

		return <section onClick={this.startEditing} className={classes.join(' ')}>
			{content}
		</section>;
	}

	updateContent=evt=>this.setState({content:evt.target.value});
	save=evt=>{
		this.setState({editing:false});
		API.pages.child(this.props.path).update({
			editor:null,
			content:this.state.content||null
		});
	}
	startEditing=evt=>{
		//内外链接不导致lock，内链接不刷页
		if(evt.target.tagName==='A'){
			var href=evt.target.getAttribute('href');
			console.log('href'+href);
			if(href.indexOf('/page/')>-1){//判定为内链接
				var toHref=href.substr(href.lastIndexOf("/")+1);
				this.context.router.transitionTo('page',{id:toHref});
				return evt.preventDefault();
			}
			return;
		}
		if(!this.props.user||this.state.editing||this.state.locked) return;
		this.setState({editing:true});
		API.pages.child(this.props.path).update({
			editor:this.props.user.username
		})
	}
}

Section.contextTypes={
	router:React.PropTypes.func.isRequired
}