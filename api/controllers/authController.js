const express = require('express');
const { BadRequestError } = require('../errors');

module.exports = class AuthController {
  constructor(container) {
    this.container = container;
    this.router = express.Router();

    this.router.post("/login", this.login.bind(this));
    this.router.post("/signin", this.signin.bind(this));
  }

  async login(req, res, next) {
    try {
      if ((req.body ?? false) || (req.body.username ?? false) || (req.body.pass ?? false)) throw new BadRequestError([
        { isErr: true, msg: "Bad Request" },
        { isErr: !!req.body.username, msg: "Missing username" },
        { isErr: !!req.body.pass, msg: "Missing password" },
      ]
        .filter(pair => pair.isErr)
        .map(err => err.msg)
        .join('\n'));
        this.container.tasksModel.auth(req.body);
    } catch (err) {
      next(err);
    }
  }

  async signin(req, res, next) {
    try {
      if ((req.body ?? false) || (req.body.username ?? false) || (req.body.pass ?? false)) throw new BadRequestError([
        { isErr: true, msg: "Bad Request" },
        { isErr: !!req.body.username, msg: "Missing username" },
        { isErr: !!req.body.pass, msg: "Missing password" },
      ]
        .filter(pair => pair.isErr)
        .map(err => err.msg)
        .join('\n'));
      this.container.tasksModel.signin(req.body);
    } catch (err) {
      next(err);
    }
  }
}