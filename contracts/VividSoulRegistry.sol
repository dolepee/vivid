// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title VividSoulRegistry
/// @notice Minimal BNB Chain proof layer for VIVID living meme identities.
contract VividSoulRegistry {
    struct Soul {
        address creator;
        bytes32 specHash;
        string memeId;
        string name;
        string ticker;
        string metadataURI;
        uint256 createdAt;
    }

    mapping(bytes32 => Soul) public souls;

    event SoulAnchored(
        bytes32 indexed soulId,
        address indexed creator,
        bytes32 indexed specHash,
        string memeId,
        string name,
        string ticker,
        string metadataURI
    );

    function anchorSoul(
        string calldata memeId,
        string calldata name,
        string calldata ticker,
        string calldata metadataURI,
        bytes32 specHash
    ) external returns (bytes32 soulId) {
        soulId = keccak256(abi.encodePacked(msg.sender, memeId, specHash));
        require(souls[soulId].createdAt == 0, "SOUL_ALREADY_ANCHORED");

        souls[soulId] = Soul({
            creator: msg.sender,
            specHash: specHash,
            memeId: memeId,
            name: name,
            ticker: ticker,
            metadataURI: metadataURI,
            createdAt: block.timestamp
        });

        emit SoulAnchored(soulId, msg.sender, specHash, memeId, name, ticker, metadataURI);
    }
}
