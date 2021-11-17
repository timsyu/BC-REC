pragma solidity ^0.8.4;
// SPDX-License-Identifier: MIT

library Lib {
    enum Role { None, Admin , Device} // Role.Device not used...
    enum State { None, Idle, Pending, Approve, DisApprove}
}