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
      if (!req.body || !req.body.username || !req.body.pass) throw new BadRequestError([
        { isErr: true, msg: "Bad Request" },
        { isErr: !!req.body.username, msg: "Missing username" },
        { isErr: !!req.body.pass, msg: "Missing password" },
      ]
        .filter(pair => pair.isErr)
        .map(err => err.msg)
        .join('\n'));
        const result = await this.container.tasksModel.login(req.body);
        res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }

  async signin(req, res, next) {
    try {
      if (!req.body || !req.body.username || !req.body.pass) throw new BadRequestError([
        { isErr: true, msg: "Bad Request" },
        { isErr: !!req.body.username, msg: "Missing username" },
        { isErr: !!req.body.pass, msg: "Missing password" },
      ]
        .filter(pair => pair.isErr)
        .map(err => err.msg)
        .join('\n'));
        const result = await this.container.tasksModel.signin(req.body);
        res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  }
}