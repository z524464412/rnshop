// 'use strict'
module.exports ={
  header:{
    method: 'POST',
    headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
    }
  },
  api:{
    base:'http://rapapi.org/mockjs/24254/',

  	creations:'api/creations',
    up:'api/up',
    comment:'api/comment',
    signup:'api/u/signup',
    verify:'api/u/verify'
  }
}