// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Donation {
    struct User {
        address walletAddress;
        string name;
        string email;
    }

    struct Campaign {
        uint256 id;
        address owner;
        string title;
        string description;
        uint256 targetAmount;
        uint256 currentAmount;
        uint256 deadline;
        string status;
    }

    struct DonationRecord {
        uint256 id;
        uint256 campaignID;
        address donor;
        uint256 amount;
        uint256 timestamp;
    }

    struct Payment {
        uint256 id;
        uint256 donationID;
        string method;
    }

    mapping(address => User) public users;
    mapping(uint256 => mapping(address => uint256)) public donorContributions;

    Campaign[] public campaigns;
    DonationRecord[] public donations;
    Payment[] public payments;

    uint256 public campaignCount = 1;
    uint256 public donationCount = 1;
    uint256 public paymentCount = 1;

    event UserRegistered(address indexed walletAddress, string name, string email);
    event CampaignCreated(uint256 indexed campaignID, string title, uint256 targetAmount, uint256 deadline, string status);
    event DonationMade(uint256 indexed donationID, uint256 indexed campaignID, address indexed donor, uint256 amount);
    event PaymentRecorded(uint256 indexed paymentID, uint256 indexed donationID, string method);
    event CampaignStatusUpdated(uint256 indexed campaignID, string status);
    event Withdrawn(uint256 indexed campaignID, address owner, uint256 amount);
    event RefundIssued(uint256 indexed campaignID, address indexed donor, uint256 amount);

    function registerUser(
        address _walletAddress,
        string memory _name,
        string memory _email
    ) public {
        require(users[_walletAddress].walletAddress == address(0), "User already exists");
        users[_walletAddress] = User(_walletAddress, _name, _email);
        emit UserRegistered(_walletAddress, _name, _email);
    }

    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _targetAmount,
        uint256 _deadline,
        string memory _status
    ) public {
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_targetAmount > 0, "Target amount must be greater than zero");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        campaigns.push(
            Campaign(
                campaignCount,
                msg.sender,
                _title,
                _description,
                _targetAmount,
                0,
                _deadline,
                _status
            )
        );
        
        emit CampaignCreated(campaignCount, _title, _targetAmount, _deadline, _status);
        campaignCount++;
    }

    function donate(uint256 _campaignID, uint256 _amount) public payable {
        require(_campaignID >= 1 && _campaignID < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignID - 1];

        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation amount must be greater than zero");
        require(msg.value == _amount, "Incorrect donation amount");
        require(
            keccak256(abi.encodePacked(campaign.status)) == keccak256(abi.encodePacked("Active")),
            "Campaign is not active"
        );

        campaign.currentAmount += msg.value;
        donorContributions[_campaignID][msg.sender] += msg.value;

        donations.push(
            DonationRecord(donationCount, _campaignID, msg.sender, msg.value, block.timestamp)
        );

        emit DonationMade(donationCount, _campaignID, msg.sender, msg.value);
        donationCount++;

        if (campaign.currentAmount >= campaign.targetAmount) {
            campaign.status = "Completed";
            emit CampaignStatusUpdated(_campaignID, "Completed");
        }
    }

    function recordPayment(uint256 _donationID, string memory _method) public {
        require(_donationID >= 1 && _donationID < donationCount, "Donation does not exist");
        
        payments.push(Payment(paymentCount, _donationID, _method));
        
        emit PaymentRecorded(paymentCount, _donationID, _method);
        paymentCount++;
    }

    function getCampaigns() public view returns (Campaign[] memory) {
        return campaigns;
    }

    function getDonations() public view returns (DonationRecord[] memory) {
        return donations;
    }

    function getCampaignByID(uint256 _campaignID) public view returns (
        uint256 id,
        address owner,
        string memory title,
        string memory description,
        uint256 targetAmount,
        uint256 currentAmount,
        uint256 deadline,
        string memory status
    ) {
        require(_campaignID >= 1 && _campaignID < campaignCount, "Campaign does not exist");

        Campaign storage campaign = campaigns[_campaignID - 1];

        return (
            campaign.id,
            campaign.owner,
            campaign.title,
            campaign.description,
            campaign.targetAmount,
            campaign.currentAmount,
            campaign.deadline,
            campaign.status
        );
    }

    function getDonationByID(uint256 _donationID) public view returns (
        uint256 id,
        uint256 campaignID,
        address donor,
        uint256 amount,
        uint256 timestamp
    ) {
        require(_donationID >= 1 && _donationID < donationCount, "Donation does not exist");

        DonationRecord storage donation = donations[_donationID - 1];

        return (
            donation.id,
            donation.campaignID,
            donation.donor,
            donation.amount,
            donation.timestamp
        );
    }

    function withdraw(uint256 _campaignID) public {
        require(_campaignID >= 1 && _campaignID < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignID - 1];

        require(msg.sender == campaign.owner, "Only owner can withdraw");
        require(
            keccak256(abi.encodePacked(campaign.status)) == keccak256(abi.encodePacked("Completed")),
            "Campaign is not completed"
        );

        uint256 amount = campaign.currentAmount;
        campaign.currentAmount = 0;
        payable(msg.sender).transfer(amount);

        emit Withdrawn(_campaignID, msg.sender, amount);
    }

    function cancelCampaign(uint256 _campaignID) public {
        require(_campaignID >= 1 && _campaignID < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignID - 1];

        require(msg.sender == campaign.owner, "Only owner can cancel the campaign");
        require(
            keccak256(abi.encodePacked(campaign.status)) == keccak256(abi.encodePacked("Active")),
            "Campaign is not active"
        );

        campaign.status = "Cancelled";
        emit CampaignStatusUpdated(_campaignID, "Cancelled");
    }

    function refund(uint256 _campaignID, address payable _to, uint256 _amount) public {
        require(_campaignID >= 1 && _campaignID < campaignCount, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignID - 1];

        bool isCancelled = keccak256(abi.encodePacked(campaign.status)) == keccak256(abi.encodePacked("Cancelled"));
        bool isFailed = block.timestamp > campaign.deadline && campaign.currentAmount < campaign.targetAmount;

        require(isCancelled || isFailed, "Refund not available for this campaign");
        require(campaign.currentAmount >= _amount, "Insufficient campaign funds");

        campaign.currentAmount -= _amount;
        _to.transfer(_amount);

        emit RefundIssued(_campaignID, _to, _amount);
    }

    function getTotalCampaigns() public view returns (uint256) {
        return campaigns.length;
    }

    function getUserDonation(uint256 _campaignID, address _user) public view returns (uint256) {
        return donorContributions[_campaignID][_user];
    }
}
