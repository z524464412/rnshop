// 'use strict'
module.exports ={
  header:{
    method: 'POST',
    headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    }
  },
  api:{
    // base:'http://rapapi.org/mockjs/24254/',

    base:'http://localhost:8888/',

  	creations:'api/creations',
    up:'api/up',
    comment:'api/comment',
    signup:'api/u/signup',
    verify:'api/u/verify',
    update:'api/u/update',
    
    signature:'api/signature'

  }
}