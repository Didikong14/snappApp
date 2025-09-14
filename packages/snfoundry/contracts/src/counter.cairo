#[starknet::interface]
pub trait ICounter<T> {
    fn get_counter(self: @T) -> u32;
    fn increase_counter(ref self: T);
    fn decrease_counter(ref self: T);
    fn set_counter(ref self: T, new_value: u32);
    fn reset_counter(ref self: T);
}

#[starknet::contract]
pub mod CounterContract {
    use OwnableComponent::InternalTrait;
    use super::ICounter;
    use starknet::storage::{StoragePointerReadAccess, StoragePointerWriteAccess};
    use starknet::{ContractAddress, get_caller_address, get_contract_address};
    use openzeppelin_access::ownable::OwnableComponent;
    use openzeppelin_token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};
    use contracts::utils::strk_address;

    component!(path: OwnableComponent, storage: ownable, event: OwnableEvent);

    #[abi(embed_v0)]
    impl OwnableImpl = OwnableComponent::OwnableImpl<ContractState>;
    impl InternalImpl = OwnableComponent::InternalImpl<ContractState>;
    
    #[event]
    #[derive(Drop, starknet::Event)]
    pub enum Event {
        CounterChanged: CounterChanged,
        #[flat]
        OwnableEvent: OwnableComponent::Event,
    }

    #[derive(Drop, starknet::Event)]
    pub struct CounterChanged {
        pub caller: ContractAddress,
        pub old_value: u32,
        pub new_value: u32,
        pub reason: ChangeReason,
    }

    #[derive(Drop, Copy, Serde)]
    pub enum ChangeReason {
        Increase,
        Decrease,
        Reset,
        Set,
    }

    #[storage]
    struct Storage {
        counter: u32,
        #[substorage(v0)]
        ownable: OwnableComponent::Storage,
    }

    #[constructor]
    fn constructor(ref self: ContractState, init_value: u32, owner: ContractAddress) {
        self.counter.write(init_value);
        self.ownable.initializer(owner);
    }

    #[abi(embed_v0)]
    impl CounterImpl of ICounter<ContractState> {
        fn get_counter(self: @ContractState) -> u32 {
            self.counter.read()
        }

        fn increase_counter(ref self: ContractState) {
            let current_value = self.counter.read();
            let new_value = current_value + 1;
            self.counter.write(new_value);

            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: new_value,
                reason: ChangeReason::Increase,
            };
            self.emit(event);
        }

        fn decrease_counter(ref self: ContractState) {
            let current_value = self.counter.read();
            assert!(current_value > 0, "The counter cannot go negative");
            let new_value = current_value - 1;
            self.counter.write(new_value);

            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: current_value,
                new_value: new_value,
                reason: ChangeReason::Decrease,
            };
            self.emit(event);
        }

        fn set_counter(ref self: ContractState, new_value: u32) {
            self.ownable.assert_only_owner();

            let old_value = self.counter.read();
            self.counter.write(new_value);

            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: old_value,
                new_value: new_value,
                reason: ChangeReason::Set,
            };
            self.emit(event);
        } 

        fn reset_counter(ref self: ContractState) {
            let payment_amount: u256 = 1000000000000000000;
            let strk_token: ContractAddress = strk_address();

            let strk_token_dispatcher = IERC20Dispatcher { contract_address: strk_token };
            let caller = get_caller_address();
            let balance = strk_token_dispatcher.balance_of(caller);
            assert!(balance >= payment_amount, "User does not have enough STRK balance");

            let contract = get_contract_address();
            let allowance = strk_token_dispatcher.allowance(caller, contract);
            assert!(allowance >= payment_amount, "User does not have enough STRK allowance");

            let owner = self.ownable.owner();
            let success = strk_token_dispatcher.transfer_from(caller, owner, payment_amount);
            assert!(success, "Failed to transfer STRK from caller to owner");

            let old_value = self.counter.read();
            self.counter.write(0);

            let event: CounterChanged = CounterChanged {
                caller: get_caller_address(),
                old_value: old_value,
                new_value: 0,
                reason: ChangeReason::Reset,
            };
            self.emit(event);
        }
    }
}